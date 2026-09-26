const prisma = require("../../config/database");

class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

const createWarehouse = async ({ name, code, address }) => {
  const normalizedCode = code.trim();
  const normalizedName = name.trim();

  const existing = await prisma.warehouse.findUnique({
    where: { code: normalizedCode },
  });

  if (existing) {
    throw new AppError("A warehouse with this short code already exists", 409);
  }

  const warehouse = await prisma.warehouse.create({
    data: {
      name: normalizedName,
      code: normalizedCode,
      location: address && address.trim() ? address.trim() : null,
    },
    include: {
      _count: {
        select: {
          locations: true,
          operations: true,
        },
      },
    },
  });

  return warehouse;
};

const getWarehouses = async ({
  search,
  isActive,
  page = 1,
  limit = 20,
} = {}) => {
  const pageNumber = Math.max(Number(page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = (pageNumber - 1) * pageSize;

  const where = {
    ...(isActive !== undefined ? { isActive: isActive === "true" } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
            { location: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [warehouses, total] = await prisma.$transaction([
    prisma.warehouse.findMany({
      where,
      include: {
        _count: {
          select: {
            locations: true,
            operations: true,
          },
        },
      },
      orderBy: { name: "asc" },
      skip,
      take: pageSize,
    }),
    prisma.warehouse.count({ where }),
  ]);

  return {
    warehouses,
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

const getWarehouseById = async (id) => {
  const warehouse = await prisma.warehouse.findUnique({
    where: { id },
    include: {
      locations: {
        where: { isActive: true },
        orderBy: { name: "asc" },
      },
      _count: {
        select: {
          locations: true,
          operations: true,
        },
      },
    },
  });

  if (!warehouse) {
    throw new AppError("Warehouse not found", 404);
  }

  return warehouse;
};

const updateWarehouse = async (id, data) => {
  const existing = await prisma.warehouse.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError("Warehouse not found", 404);
  }

  if (data.code) {
    const duplicate = await prisma.warehouse.findUnique({
      where: { code: data.code.trim() },
    });

    if (duplicate && duplicate.id !== id) {
      throw new AppError(
        "A warehouse with this short code already exists",
        409,
      );
    }
  }

  return prisma.warehouse.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.code !== undefined ? { code: data.code.trim() } : {}),
      ...(data.address !== undefined
        ? {
            location:
              data.address && data.address.trim() ? data.address.trim() : null,
          }
        : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
    include: {
      _count: {
        select: {
          locations: true,
          operations: true,
        },
      },
    },
  });
};

const deleteWarehouse = async (id) => {
  const existing = await prisma.warehouse.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError("Warehouse not found", 404);
  }

  return prisma.warehouse.update({
    where: { id },
    data: { isActive: false },
  });
};

module.exports = {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse,
};
