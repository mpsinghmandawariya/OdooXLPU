const prisma = require("../../config/database");

class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

const getWarehouses = async (query = {}) => {
  const where = {};

  if (query.isActive !== undefined) {
    where.isActive = query.isActive === "true" || query.isActive === true;
  }

  if (query.search) {
    const search = query.search.trim();
    where.OR = [
      { name: { contains: search } },
      { code: { contains: search } },
      { location: { contains: search } },
    ];
  }

  return prisma.warehouse.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
};

const getWarehouseById = async (id) => {
  const warehouse = await prisma.warehouse.findUnique({
    where: { id },
  });

  if (!warehouse) {
    throw new AppError("Warehouse not found", 404);
  }

  return warehouse;
};

const createWarehouse = async (payload) => {
  const code = payload.code.trim();
  const name = payload.name.trim();
  const location = payload.location?.trim() || null;

  const existingWarehouse = await prisma.warehouse.findUnique({
    where: { code },
  });

  if (existingWarehouse) {
    throw new AppError("A warehouse with this code already exists", 409);
  }

  return prisma.warehouse.create({
    data: {
      code,
      name,
      location,
    },
  });
};

const updateWarehouse = async (id, payload) => {
  const existingWarehouse = await prisma.warehouse.findUnique({
    where: { id },
  });

  if (!existingWarehouse) {
    throw new AppError("Warehouse not found", 404);
  }

  if (payload.code && payload.code.trim() !== existingWarehouse.code) {
    const duplicateCode = await prisma.warehouse.findUnique({
      where: { code: payload.code.trim() },
    });

    if (duplicateCode) {
      throw new AppError("A warehouse with this code already exists", 409);
    }
  }

  return prisma.warehouse.update({
    where: { id },
    data: {
      code: payload.code ? payload.code.trim() : undefined,
      name: payload.name ? payload.name.trim() : undefined,
      location:
        payload.location === undefined
          ? undefined
          : payload.location?.trim() || null,
      isActive: payload.isActive,
    },
  });
};

const deleteWarehouse = async (id) => {
  const existingWarehouse = await prisma.warehouse.findUnique({
    where: { id },
  });

  if (!existingWarehouse) {
    throw new AppError("Warehouse not found", 404);
  }

  return prisma.warehouse.update({
    where: { id },
    data: { isActive: false },
  });
};

module.exports = {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
};
