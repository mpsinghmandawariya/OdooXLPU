const prisma = require("../../config/database");

const getMoveHistory = async ({ search, productId, warehouseId, moveType, fromDate, toDate, page = 1, limit = 20 } = {}) => {
  const pageNumber = Math.max(Number(page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = (pageNumber - 1) * pageSize;

  const where = {
    ...(productId ? { productId } : {}),
    ...(moveType ? { moveType } : {}),
    ...(search
      ? {
          OR: [
            { reference: { contains: search, mode: "insensitive" } },
            { contact: { contains: search, mode: "insensitive" } },
            { product: { name: { contains: search, mode: "insensitive" } } },
            { product: { sku: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(fromDate || toDate
      ? { createdAt: { ...(fromDate ? { gte: new Date(fromDate) } : {}), ...(toDate ? { lte: new Date(toDate) } : {}) } }
      : {}),
  };

  // Filter by warehouse via location relation
  if (warehouseId) {
    where.OR = [
      { sourceLocation: { warehouseId } },
      { destinationLocation: { warehouseId } },
    ];
  }

  const INCLUDE = {
    product: { select: { id: true, name: true, sku: true, unitOfMeasure: true } },
    sourceLocation: {
      select: { id: true, name: true, shortCode: true, warehouse: { select: { id: true, name: true, code: true } } },
    },
    destinationLocation: {
      select: { id: true, name: true, shortCode: true, warehouse: { select: { id: true, name: true, code: true } } },
    },
    createdBy: { select: { id: true, loginId: true } },
  };

  const [moves, total] = await Promise.all([
    prisma.stockMove.findMany({ where, include: INCLUDE, orderBy: { createdAt: "desc" }, skip, take: pageSize }),
    prisma.stockMove.count({ where }),
  ]);

  return {
    data: moves,
    pagination: { page: pageNumber, limit: pageSize, total, totalPages: Math.ceil(total / pageSize) || 1 },
  };
};

module.exports = { getMoveHistory };
