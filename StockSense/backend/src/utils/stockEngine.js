const { Prisma } = require("@prisma/client");

class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

/**
 * Increment stock at a location (used by receipts).
 * Must be called inside a Prisma transaction.
 */
const incrementStock = async (tx, { productId, locationId, quantity }) => {
  return tx.stockBalance.upsert({
    where: { productId_locationId: { productId, locationId } },
    update: { quantity: { increment: new Prisma.Decimal(quantity) } },
    create: {
      productId,
      locationId,
      quantity: new Prisma.Decimal(quantity),
      reservedQuantity: new Prisma.Decimal(0),
    },
  });
};

/**
 * Decrement stock at a location (used by deliveries).
 * Throws if available stock is insufficient.
 * Must be called inside a Prisma transaction.
 */
const decrementStock = async (tx, { productId, locationId, quantity }) => {
  const balance = await tx.stockBalance.findUnique({
    where: { productId_locationId: { productId, locationId } },
  });

  const onHand = balance ? Number(balance.quantity) : 0;
  const reserved = balance ? Number(balance.reservedQuantity) : 0;
  const available = onHand - reserved;

  if (available < quantity) {
    throw new AppError(
      `Insufficient stock. Available: ${available}, Requested: ${quantity}`,
      400,
    );
  }

  return tx.stockBalance.update({
    where: { productId_locationId: { productId, locationId } },
    data: { quantity: { decrement: new Prisma.Decimal(quantity) } },
  });
};

/**
 * Record a stock move in the central ledger.
 * Must be called inside a Prisma transaction.
 */
const recordMove = async (
  tx,
  {
    reference,
    productId,
    quantity,
    moveType,
    sourceLocationId = null,
    destinationLocationId = null,
    operationId = null,
    operationType = null,
    contact = null,
    notes = null,
    createdById,
  },
) => {
  return tx.stockMove.create({
    data: {
      reference,
      productId,
      quantity: new Prisma.Decimal(quantity),
      moveType,
      sourceLocationId,
      destinationLocationId,
      operationId,
      operationType,
      contact,
      notes,
      createdById,
    },
  });
};

module.exports = { incrementStock, decrementStock, recordMove, AppError };
