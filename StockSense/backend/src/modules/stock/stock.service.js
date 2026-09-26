const prisma = require("../../config/database");

// ======================================================
// GET STOCK LIST
// ======================================================

const getStock = async ({
  search,
  warehouseId,
  locationId,
  categoryId,
  page = 1,
  limit = 20,
}) => {
  const pageNumber = Math.max(Number(page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = (pageNumber - 1) * pageSize;

  const where = {
    product: {
      isActive: true,

      ...(categoryId
        ? {
            categoryId,
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },

              {
                sku: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },

    location: {
      isActive: true,

      ...(warehouseId
        ? {
            warehouseId,
          }
        : {}),

      ...(locationId
        ? {
            id: locationId,
          }
        : {}),
    },
  };

  const [stock, total] = await prisma.$transaction([
    prisma.stockBalance.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            unitOfMeasure: true,
            unitPrice: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            shortCode: true,
            warehouse: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          product: {
            name: "asc",
          },
        },
        {
          location: {
            name: "asc",
          },
        },
      ],
      skip,
      take: pageSize,
    }),
    prisma.stockBalance.count({
      where,
    }),
  ]);

  const data = stock.map((item) => {
    const onHand = Number(item.quantity);
    const reserved = Number(item.reservedQuantity);
    const freeToUse = Math.max(onHand - reserved, 0);

    return {
      id: item.id,
      product: {
        id: item.product.id,
        name: item.product.name,
        sku: item.product.sku,
        unitOfMeasure: item.product.unitOfMeasure,
        category: item.product.category,
      },
      location: {
        id: item.location.id,
        name: item.location.name,
        shortCode: item.location.shortCode,
      },
      warehouse: {
        id: item.location.warehouse.id,
        name: item.location.warehouse.name,
        code: item.location.warehouse.code,
      },
      unitCost: Number(item.product.unitPrice),
      onHand,
      reserved,
      freeToUse,
      inventoryValue: onHand * Number(item.product.unitPrice),
    };
  });

  return {
    data,
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

// ======================================================
// GET PRODUCT STOCK
// ======================================================

const getProductStock = async (productId) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      name: true,
      sku: true,
      unitOfMeasure: true,
      unitPrice: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  const balances = await prisma.stockBalance.findMany({
    where: {
      productId,
      location: {
        isActive: true,
      },
    },
    include: {
      location: {
        select: {
          id: true,
          name: true,
          shortCode: true,
          warehouse: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
    },
  });

  let totalOnHand = 0;
  let totalReserved = 0;

  const locations = balances.map((item) => {
    const onHand = Number(item.quantity);
    const reserved = Number(item.reservedQuantity);

    totalOnHand += onHand;
    totalReserved += reserved;

    return {
      location: item.location,
      onHand,
      reserved,
      freeToUse: Math.max(onHand - reserved, 0),
    };
  });

  return {
    product: {
      ...product,
      unitPrice: Number(product.unitPrice),
    },
    totalOnHand,
    totalReserved,
    totalFreeToUse: Math.max(totalOnHand - totalReserved, 0),
    locations,
  };
};

// ======================================================
// GET LOCATION STOCK
// ======================================================

const getLocationStock = async (locationId) => {
  const location = await prisma.location.findUnique({
    where: {
      id: locationId,
    },
    select: {
      id: true,
      name: true,
      shortCode: true,
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
    const error = new Error("Location not found");
    error.statusCode = 404;
    throw error;
  }

  const stock = await prisma.stockBalance.findMany({
    where: {
      locationId,
      product: {
        isActive: true,
      },
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          unitOfMeasure: true,
          unitPrice: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      product: {
        name: "asc",
      },
    },
  });

  return {
    location,
    stock: stock.map((item) => {
      const onHand = Number(item.quantity);
      const reserved = Number(item.reservedQuantity);

      return {
        product: item.product,
        unitCost: Number(item.product.unitPrice),
        onHand,
        reserved,
        freeToUse: Math.max(onHand - reserved, 0),
      };
    }),
  };
};

module.exports = {
  getStock,
  getProductStock,
  getLocationStock,
};
