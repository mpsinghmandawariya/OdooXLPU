const prisma = require("../../config/database");
const {
  generateReference,
  previewReference,
} = require("../../utils/referenceGenerator");
const {
  decrementStock,
  recordMove,
  AppError,
} = require("../../utils/stockEngine");

const STATUS_TO_LABEL = {
  DRAFT: "DRAFT",
  READY: "READY",
  COMPLETED: "DONE",
  CANCELLED: "CANCELED",
};

const INCLUDE = {
  product: { select: { id: true, name: true, sku: true, unitOfMeasure: true } },
  warehouse: { select: { id: true, name: true, code: true } },
  location: { select: { id: true, name: true, shortCode: true } },
  createdBy: { select: { id: true, loginId: true } },
};

const buildListItem = (op) => ({
  id: op.id,
  referenceNumber: op.referenceNumber,
  contact: op.contact || "-",
  from: op.location ? `${op.warehouse?.name || ""} / ${op.location.name}` : "-",
  to: op.contact || "-",
  scheduledDate: op.scheduledDate,
  status: STATUS_TO_LABEL[op.status] || op.status,
  product: op.product,
  warehouse: op.warehouse,
  location: op.location,
  quantity: op.quantity,
  unitCost: op.unitCost,
  notes: op.notes,
  createdBy: op.createdBy,
  createdAt: op.createdAt,
});

const getDeliveries = async ({
  status,
  search,
  warehouseId,
  locationId,
  page = 1,
  limit = 20,
} = {}) => {
  const pageNumber = Math.max(Number(page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = (pageNumber - 1) * pageSize;

  const STATUS_FROM_LABEL = {
    WAITING: "DRAFT",
    READY: "READY",
    DONE: "COMPLETED",
    DRAFT: "DRAFT",
    CANCELED: "CANCELLED",
  };
  const dbStatus = status ? STATUS_FROM_LABEL[status] || status : undefined;

  const where = {
    type: "DELIVERY",
    ...(dbStatus ? { status: dbStatus } : {}),
    ...(warehouseId ? { warehouseId } : {}),
    ...(locationId ? { locationId } : {}),
    ...(search
      ? {
          OR: [
            { referenceNumber: { contains: search } },
            { contact: { contains: search } },
            { product: { name: { contains: search } } },
          ],
        }
      : {}),
  };

  const [raw, total] = await Promise.all([
    prisma.inventoryOperation.findMany({
      where,
      include: INCLUDE,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.inventoryOperation.count({ where }),
  ]);

  return {
    data: raw.map(buildListItem),
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    },
  };
};

const getDeliveryById = async (id) => {
  const delivery = await prisma.inventoryOperation.findUnique({
    where: { id },
    include: INCLUDE,
  });
  if (!delivery || delivery.type !== "DELIVERY")
    throw new AppError("Delivery not found", 404);
  return delivery;
};

const getNextReference = () => previewReference("DELIVERY");

const createDelivery = async (payload, userId) => {
  if (!userId) throw new AppError("Authentication required", 401);

  const quantity = Number(payload.quantity);
  if (!Number.isFinite(quantity) || quantity <= 0)
    throw new AppError("Quantity must be greater than zero", 400);

  const product = await prisma.product.findUnique({
    where: { id: payload.productId },
  });
  if (!product) throw new AppError("Product not found", 404);

  const location = await prisma.location.findUnique({
    where: { id: payload.locationId },
    include: { warehouse: { select: { id: true, name: true, code: true } } },
  });
  if (!location || !location.isActive)
    throw new AppError("Location not found", 404);

  if (payload.warehouseId && payload.warehouseId !== location.warehouseId)
    throw new AppError(
      "Location does not belong to the selected warehouse",
      400,
    );

  const status = payload.status === "DRAFT" ? "DRAFT" : "COMPLETED";

  return prisma.$transaction(async (tx) => {
    const referenceNumber =
      payload.referenceNumber?.trim() ||
      (await generateReference("DELIVERY", tx));

    const existing = await tx.inventoryOperation.findUnique({
      where: { referenceNumber },
    });
    if (existing)
      throw new AppError(
        "A delivery with this reference number already exists",
        409,
      );

    const operation = await tx.inventoryOperation.create({
      data: {
        type: "DELIVERY",
        status,
        referenceNumber,
        contact: payload.contact?.trim() || null,
        quantity,
        unitCost:
          payload.unitCost !== undefined ? Number(payload.unitCost) : null,
        productId: product.id,
        warehouseId: location.warehouseId,
        locationId: location.id,
        createdById: userId,
        scheduledDate: payload.scheduledDate
          ? new Date(payload.scheduledDate)
          : new Date(),
        completedAt: status === "COMPLETED" ? new Date() : null,
        notes: payload.notes?.trim() || null,
      },
      include: INCLUDE,
    });

    if (status === "COMPLETED") {
      await decrementStock(tx, {
        productId: product.id,
        locationId: location.id,
        quantity,
      });
      await recordMove(tx, {
        reference: referenceNumber,
        productId: product.id,
        quantity,
        moveType: "OUT",
        sourceLocationId: location.id,
        operationId: operation.id,
        operationType: "DELIVERY",
        contact: payload.contact?.trim() || null,
        notes: payload.notes?.trim() || null,
        createdById: userId,
      });
    }

    return operation;
  });
};

const validateDelivery = async (id, userId) => {
  const delivery = await prisma.inventoryOperation.findUnique({
    where: { id },
  });
  if (!delivery || delivery.type !== "DELIVERY")
    throw new AppError("Delivery not found", 404);
  if (delivery.status === "COMPLETED")
    throw new AppError("Delivery is already completed", 400);
  if (delivery.status === "CANCELLED")
    throw new AppError("Cannot validate a cancelled delivery", 400);
  if (delivery.status !== "READY")
    throw new AppError("Delivery must be ready before validation", 400);

  const quantity = Number(delivery.quantity);

  return prisma.$transaction(async (tx) => {
    await decrementStock(tx, {
      productId: delivery.productId,
      locationId: delivery.locationId,
      quantity,
    });

    await recordMove(tx, {
      reference: delivery.referenceNumber,
      productId: delivery.productId,
      quantity,
      moveType: "OUT",
      sourceLocationId: delivery.locationId,
      operationId: delivery.id,
      operationType: "DELIVERY",
      contact: delivery.contact,
      notes: delivery.notes,
      createdById: userId,
    });

    return tx.inventoryOperation.update({
      where: { id },
      data: { status: "COMPLETED", completedAt: new Date() },
      include: INCLUDE,
    });
  });
};

const markDeliveryReady = async (id) => {
  const delivery = await prisma.inventoryOperation.findUnique({
    where: { id },
  });
  if (!delivery || delivery.type !== "DELIVERY")
    throw new AppError("Delivery not found", 404);
  if (delivery.status !== "DRAFT")
    throw new AppError("Only draft deliveries can be marked ready", 400);

  return prisma.inventoryOperation.update({
    where: { id },
    data: { status: "READY" },
    include: INCLUDE,
  });
};

const cancelDelivery = async (id) => {
  const delivery = await prisma.inventoryOperation.findUnique({
    where: { id },
  });
  if (!delivery || delivery.type !== "DELIVERY")
    throw new AppError("Delivery not found", 404);
  if (["COMPLETED", "CANCELLED"].includes(delivery.status)) {
    throw new AppError("This delivery cannot be cancelled", 400);
  }

  return prisma.inventoryOperation.update({
    where: { id },
    data: { status: "CANCELLED" },
    include: INCLUDE,
  });
};

module.exports = {
  getDeliveries,
  getDeliveryById,
  getNextReference,
  createDelivery,
  validateDelivery,
  markDeliveryReady,
  cancelDelivery,
};
