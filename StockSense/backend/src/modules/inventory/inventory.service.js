const prisma = require("../../config/database");
const { generateReference } = require("../../utils/referenceGenerator");
const { decrementStock, incrementStock, recordMove, AppError } = require("../../utils/stockEngine");

const INCLUDE = {
  product: { select: { id: true, name: true, sku: true, unitOfMeasure: true } },
  warehouse: { select: { id: true, name: true, code: true } },
  location: { select: { id: true, name: true, shortCode: true } },
  sourceLocation: { select: { id: true, name: true, shortCode: true } },
  destinationLocation: { select: { id: true, name: true, shortCode: true } },
  createdBy: { select: { id: true, loginId: true } },
};

const getOperation = async (id, type) => {
  const operation = await prisma.inventoryOperation.findUnique({
    where: { id },
    include: INCLUDE,
  });

  if (!operation || operation.type !== type) {
    throw new AppError(
      `${type === "TRANSFER" ? "Transfer" : "Adjustment"} not found`,
      404,
    );
  }

  return operation;
};

const createTransfer = async ({
  productId,
  sourceLocationId,
  destinationLocationId,
  quantity,
  scheduledDate,
  notes,
  contact,
  userId,
}) => {
  if (sourceLocationId === destinationLocationId) {
    throw new AppError("Source and destination locations must be different", 400);
  }

  const amount = Number(quantity);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new AppError("Quantity must be greater than zero", 400);
  }

  const [product, source, destination] = await Promise.all([
    prisma.product.findUnique({ where: { id: productId } }),
    prisma.location.findUnique({ where: { id: sourceLocationId } }),
    prisma.location.findUnique({ where: { id: destinationLocationId } }),
  ]);

  if (!product || !product.isActive) throw new AppError("Product not found", 404);
  if (!source || !source.isActive) throw new AppError("Source location not found", 404);
  if (!destination || !destination.isActive) throw new AppError("Destination location not found", 404);

  return prisma.$transaction(async (tx) => {
    const referenceNumber = await generateReference("TRANSFER", tx);
    return tx.inventoryOperation.create({
      data: {
        type: "TRANSFER",
        status: "DRAFT",
        referenceNumber,
        contact: contact?.trim() || null,
        productId,
        warehouseId: source.warehouseId,
        locationId: sourceLocationId,
        sourceLocationId,
        destinationLocationId,
        quantity: amount,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
        notes: notes?.trim() || null,
        createdById: userId,
      },
      include: INCLUDE,
    });
  });
};

const createAdjustment = async ({ productId, locationId, quantity, notes, userId }) => {
  const countedQuantity = Number(quantity);
  if (!Number.isFinite(countedQuantity) || countedQuantity < 0) {
    throw new AppError("Counted quantity must be zero or greater", 400);
  }

  const [product, location] = await Promise.all([
    prisma.product.findUnique({ where: { id: productId } }),
    prisma.location.findUnique({ where: { id: locationId } }),
  ]);

  if (!product || !product.isActive) throw new AppError("Product not found", 404);
  if (!location || !location.isActive) throw new AppError("Location not found", 404);

  return prisma.$transaction(async (tx) => {
    const referenceNumber = await generateReference("ADJUSTMENT", tx);
    return tx.inventoryOperation.create({
      data: {
        type: "ADJUSTMENT",
        status: "DRAFT",
        referenceNumber,
        productId,
        warehouseId: location.warehouseId,
        locationId,
        quantity: countedQuantity,
        notes: notes?.trim() || null,
        createdById: userId,
      },
      include: INCLUDE,
    });
  });
};

const markReady = async (id, type) => {
  const operation = await getOperation(id, type);
  if (operation.status !== "DRAFT")
    throw new AppError("Only draft operations can be marked ready", 400);

  return prisma.inventoryOperation.update({
    where: { id },
    data: { status: "READY" },
    include: INCLUDE,
  });
};

const cancel = async (id, type) => {
  const operation = await getOperation(id, type);
  if (["COMPLETED", "CANCELLED"].includes(operation.status)) {
    throw new AppError("This operation cannot be cancelled", 400);
  }

  return prisma.inventoryOperation.update({
    where: { id },
    data: { status: "CANCELLED" },
    include: INCLUDE,
  });
};

const validateTransfer = async (id, userId) =>
  prisma.$transaction(async (tx) => {
    const operation = await tx.inventoryOperation.findUnique({ where: { id } });
    if (!operation || operation.type !== "TRANSFER")
      throw new AppError("Transfer not found", 404);
    if (operation.status !== "READY")
      throw new AppError("Transfer must be ready before validation", 400);

    await decrementStock(tx, {
      productId: operation.productId,
      locationId: operation.sourceLocationId,
      quantity: operation.quantity,
    });
    await incrementStock(tx, {
      productId: operation.productId,
      locationId: operation.destinationLocationId,
      quantity: operation.quantity,
    });
    await recordMove(tx, {
      reference: operation.referenceNumber,
      productId: operation.productId,
      quantity: operation.quantity,
      moveType: "TRANSFER",
      sourceLocationId: operation.sourceLocationId,
      destinationLocationId: operation.destinationLocationId,
      operationId: operation.id,
      operationType: "TRANSFER",
      notes: operation.notes,
      createdById: userId,
    });

    return tx.inventoryOperation.update({
      where: { id },
      data: { status: "COMPLETED", completedAt: new Date() },
      include: INCLUDE,
    });
  });

const validateAdjustment = async (id, userId) =>
  prisma.$transaction(async (tx) => {
    const operation = await tx.inventoryOperation.findUnique({ where: { id } });
    if (!operation || operation.type !== "ADJUSTMENT")
      throw new AppError("Adjustment not found", 404);
    if (operation.status !== "READY")
      throw new AppError("Adjustment must be ready before validation", 400);

    const balance = await tx.stockBalance.findUnique({
      where: {
        productId_locationId: {
          productId: operation.productId,
          locationId: operation.locationId,
        },
      },
    });
    const currentQuantity = balance ? Number(balance.quantity) : 0;
    const reservedQuantity = balance ? Number(balance.reservedQuantity) : 0;
    const countedQuantity = Number(operation.quantity);
    const difference = countedQuantity - currentQuantity;

    if (countedQuantity < reservedQuantity) {
      throw new AppError(
        `Counted quantity cannot be below reserved stock (${reservedQuantity})`,
        400,
      );
    }

    await tx.stockBalance.upsert({
      where: {
        productId_locationId: {
          productId: operation.productId,
          locationId: operation.locationId,
        },
      },
      create: {
        productId: operation.productId,
        locationId: operation.locationId,
        quantity: countedQuantity,
        reservedQuantity: 0,
      },
      update: { quantity: countedQuantity },
    });

    if (difference !== 0) {
      await recordMove(tx, {
        reference: operation.referenceNumber,
        productId: operation.productId,
        quantity: difference,
        moveType: "ADJUSTMENT",
        sourceLocationId: operation.locationId,
        operationId: operation.id,
        operationType: "ADJUSTMENT",
        notes: operation.notes,
        createdById: userId,
      });
    }

    return tx.inventoryOperation.update({
      where: { id },
      data: { status: "COMPLETED", completedAt: new Date() },
      include: INCLUDE,
    });
  });

module.exports = {
  createTransfer,
  createAdjustment,
  getOperation,
  markReady,
  cancel,
  validateTransfer,
  validateAdjustment,
};
