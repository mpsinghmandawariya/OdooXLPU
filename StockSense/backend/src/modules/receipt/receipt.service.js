const prisma = require("../../config/database");
const {
  generateReference,
  previewReference,
} = require("../../utils/referenceGenerator");
const {
  incrementStock,
  recordMove,
  AppError,
} = require("../../utils/stockEngine");

const STATUS_TO_LABEL = {
  DRAFT: "DRAFT",
  READY: "READY",
  COMPLETED: "DONE",
  CANCELLED: "CANCELED",
};

const buildListItem = (op) => ({
  id: op.id,
  referenceNumber: op.referenceNumber,
  contact: op.contact || op.product?.name || "-",
  from: op.contact || "-",
  to: op.location ? `${op.warehouse?.name || ""} / ${op.location.name}` : "-",
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

const INCLUDE = {
  product: { select: { id: true, name: true, sku: true, unitOfMeasure: true } },
  warehouse: { select: { id: true, name: true, code: true } },
  location: { select: { id: true, name: true, shortCode: true } },
  createdBy: { select: { id: true, loginId: true } },
};

// ── List ──────────────────────────────────────────────────────────────────────

const getReceipts = async ({
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
    READY: "READY",
    DONE: "COMPLETED",
    WAITING: "READY",
    DRAFT: "DRAFT",
    CANCELED: "CANCELLED",
  };
  const dbStatus = status ? STATUS_FROM_LABEL[status] || status : undefined;

  const where = {
    type: "RECEIPT",
    ...(dbStatus ? { status: dbStatus } : {}),
    ...(warehouseId ? { warehouseId } : {}),
    ...(locationId ? { locationId } : {}),
    ...(search
      ? {
          OR: [
            { referenceNumber: { contains: search } },
            { contact: { contains: search } },
            { product: { name: { contains: search } } },
            { product: { sku: { contains: search } } },
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

// ── Get one ───────────────────────────────────────────────────────────────────

const getReceiptById = async (id) => {
  const receipt = await prisma.inventoryOperation.findUnique({
    where: { id },
    include: INCLUDE,
  });
  if (!receipt || receipt.type !== "RECEIPT")
    throw new AppError("Receipt not found", 404);
  return receipt;
};

// ── Preview next reference ────────────────────────────────────────────────────

const getNextReference = () => previewReference("RECEIPT");

// ── Create (DRAFT or COMPLETED) ───────────────────────────────────────────────

const createReceipt = async (payload, userId) => {
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

  const unitCost =
    payload.unitCost !== undefined ? Number(payload.unitCost) : null;
  if (unitCost !== null && (!Number.isFinite(unitCost) || unitCost < 0))
    throw new AppError("Unit cost must be zero or greater", 400);

  const status = payload.status === "DRAFT" ? "DRAFT" : "COMPLETED";

  return prisma.$transaction(async (tx) => {
    const referenceNumber =
      payload.referenceNumber?.trim() ||
      (await generateReference("RECEIPT", tx));

    const existing = await tx.inventoryOperation.findUnique({
      where: { referenceNumber },
    });
    if (existing)
      throw new AppError(
        "A receipt with this reference number already exists",
        409,
      );

    const operation = await tx.inventoryOperation.create({
      data: {
        type: "RECEIPT",
        status,
        referenceNumber,
        contact: payload.contact?.trim() || null,
        quantity: quantity,
        unitCost: unitCost,
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
      await incrementStock(tx, {
        productId: product.id,
        locationId: location.id,
        quantity,
      });
      await recordMove(tx, {
        reference: referenceNumber,
        productId: product.id,
        quantity,
        moveType: "IN",
        destinationLocationId: location.id,
        operationId: operation.id,
        operationType: "RECEIPT",
        contact: payload.contact?.trim() || null,
        notes: payload.notes?.trim() || null,
        createdById: userId,
      });
    }

    return operation;
  });
};

// ── Validate DRAFT → COMPLETED ────────────────────────────────────────────────

const validateReceipt = async (id, userId) => {
  const receipt = await prisma.inventoryOperation.findUnique({ where: { id } });
  if (!receipt || receipt.type !== "RECEIPT")
    throw new AppError("Receipt not found", 404);
  if (receipt.status === "COMPLETED")
    throw new AppError("Receipt is already completed", 400);
  if (receipt.status === "CANCELLED")
    throw new AppError("Cannot validate a cancelled receipt", 400);
  if (receipt.status !== "READY")
    throw new AppError("Receipt must be ready before validation", 400);

  const quantity = Number(receipt.quantity);

  return prisma.$transaction(async (tx) => {
    await incrementStock(tx, {
      productId: receipt.productId,
      locationId: receipt.locationId,
      quantity,
    });

    await recordMove(tx, {
      reference: receipt.referenceNumber,
      productId: receipt.productId,
      quantity,
      moveType: "IN",
      destinationLocationId: receipt.locationId,
      operationId: receipt.id,
      operationType: "RECEIPT",
      contact: receipt.contact,
      notes: receipt.notes,
      createdById: userId,
    });

    return tx.inventoryOperation.update({
      where: { id },
      data: { status: "COMPLETED", completedAt: new Date() },
      include: INCLUDE,
    });
  });
};

const markReceiptReady = async (id) => {
  const receipt = await prisma.inventoryOperation.findUnique({ where: { id } });
  if (!receipt || receipt.type !== "RECEIPT")
    throw new AppError("Receipt not found", 404);
  if (receipt.status !== "DRAFT")
    throw new AppError("Only draft receipts can be marked ready", 400);

  return prisma.inventoryOperation.update({
    where: { id },
    data: { status: "READY" },
    include: INCLUDE,
  });
};

const cancelReceipt = async (id) => {
  const receipt = await prisma.inventoryOperation.findUnique({ where: { id } });
  if (!receipt || receipt.type !== "RECEIPT")
    throw new AppError("Receipt not found", 404);
  if (["COMPLETED", "CANCELLED"].includes(receipt.status)) {
    throw new AppError("This receipt cannot be cancelled", 400);
  }

  return prisma.inventoryOperation.update({
    where: { id },
    data: { status: "CANCELLED" },
    include: INCLUDE,
  });
};

module.exports = {
  getReceipts,
  getReceiptById,
  getNextReference,
  createReceipt,
  validateReceipt,
  markReceiptReady,
  cancelReceipt,
};
