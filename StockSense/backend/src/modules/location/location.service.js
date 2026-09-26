const prisma = require("../../config/database");
const { AppError } = require("../../utils/errors");

const createLocation = async ({ name, shortCode, warehouseId }) => {
  const warehouse = await prisma.warehouse.findUnique({
    where: { id: warehouseId },
  });

  if (!warehouse || !warehouse.isActive) {
    throw new AppError("Selected warehouse does not exist", 404);
  }

  const existingLocation = await prisma.location.findUnique({
    where: {
      warehouseId_shortCode: {
        warehouseId,
        shortCode: shortCode.trim(),
      },
    },
  });

  if (existingLocation) {
    throw new AppError(
      "This short code already exists in the selected warehouse",
      409,
    );
  }

  const location = await prisma.location.create({
    data: {
      name: name.trim(),
      shortCode: shortCode.trim(),
      warehouseId,
    },
    include: {
      warehouse: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  return location;
};

const getLocations = async ({
  warehouseId,
  search,
  page = 1,
  limit = 20,
} = {}) => {
  const pageNumber = Math.max(Number(page), 1);
  const pageSize = Math.min(Math.max(Number(limit), 1), 100);
  const skip = (pageNumber - 1) * pageSize;

  const where = {
    isActive: true,
    ...(warehouseId ? { warehouseId } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { shortCode: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [locations, total] = await prisma.$transaction([
    prisma.location.findMany({
      where,
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      skip,
      take: pageSize,
    }),
    prisma.location.count({ where }),
  ]);

  return {
    locations,
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

const getLocationById = async (id) => {
  const location = await prisma.location.findUnique({
    where: { id },
    include: {
      warehouse: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  if (!location) {
    throw new AppError("Location not found", 404);
  }

  return location;
};

const updateLocation = async (id, data) => {
  const location = await prisma.location.findUnique({
    where: { id },
  });

  if (!location) {
    throw new AppError("Location not found", 404);
  }

  if (data.warehouseId || data.shortCode) {
    const warehouseId = data.warehouseId || location.warehouseId;
    const shortCode = (data.shortCode || location.shortCode).trim();

    const duplicate = await prisma.location.findUnique({
      where: {
        warehouseId_shortCode: {
          warehouseId,
          shortCode,
        },
      },
    });

    if (duplicate && duplicate.id !== id) {
      throw new AppError(
        "This short code already exists in the selected warehouse",
        409,
      );
    }
  }

  const updatedLocation = await prisma.location.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.shortCode !== undefined
        ? { shortCode: data.shortCode.trim() }
        : {}),
      ...(data.warehouseId !== undefined
        ? { warehouseId: data.warehouseId }
        : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
    include: {
      warehouse: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  return updatedLocation;
};

const deleteLocation = async (id) => {
  const location = await prisma.location.findUnique({
    where: { id },
  });

  if (!location) {
    throw new AppError("Location not found", 404);
  }

  return prisma.location.update({
    where: { id },
    data: { isActive: false },
  });
};

module.exports = {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
};
