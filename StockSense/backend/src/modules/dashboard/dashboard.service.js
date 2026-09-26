const prisma = require("../../config/database");

const getDashboardSummary = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalProducts,
    totalWarehouses,
    totalLocations,
    totalStockItems,
    totalOnHand,
    totalReserved,
    pendingReceipts,
    pendingDeliveries,
    lateReceipts,
    lateDeliveries,
    stockBalances,
    reorderingRules,
    recentOperations,
  ] = await prisma.$transaction([
    prisma.product.count({
      where: { isActive: true },
    }),

    prisma.warehouse.count({
      where: { isActive: true },
    }),

    prisma.location.count({
      where: { isActive: true },
    }),

    prisma.stockBalance.count(),

    prisma.stockBalance.aggregate({
      _sum: { quantity: true },
    }),

    prisma.stockBalance.aggregate({
      _sum: { reservedQuantity: true },
    }),

    prisma.inventoryOperation.count({
      where: {
        type: "RECEIPT",
        status: "READY",
      },
    }),

    prisma.inventoryOperation.count({
      where: {
        type: "DELIVERY",
        status: "READY",
      },
    }),

    prisma.inventoryOperation.count({
      where: {
        type: { in: ["RECEIPT", "TRANSFER"] },
        status: {
          in: ["READY"],
        },
        scheduledDate: {
          lt: today,
        },
      },
    }),

    prisma.inventoryOperation.count({
      where: {
        type: { in: ["DELIVERY", "TRANSFER"] },
        status: {
          in: ["READY"],
        },
        scheduledDate: {
          lt: today,
        },
      },
    }),

    prisma.stockBalance.findMany({
      where: {
        product: { isActive: true },
        location: { isActive: true },
      },
      select: {
        productId: true,
        locationId: true,
        quantity: true,
        reservedQuantity: true,
        location: { select: { warehouseId: true } },
      },
    }),

    prisma.reorderingRule.findMany({
      where: { isActive: true },
      select: {
        productId: true,
        warehouseId: true,
        locationId: true,
        minimumQuantity: true,
      },
    }),

    prisma.inventoryOperation.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
        warehouse: {
          select: { id: true, name: true, code: true },
        },
        location: {
          select: { id: true, name: true, shortCode: true },
        },
      },
    }),
  ]);

  const onHand = Number(totalOnHand._sum.quantity || 0);
  const reserved = Number(totalReserved._sum.reservedQuantity || 0);
  const fallbackLowStock = stockBalances.filter((balance) => {
    const freeToUse =
      Number(balance.quantity) - Number(balance.reservedQuantity);
    return freeToUse > 0 && freeToUse <= 10;
  }).length;
  const ruleLowStock = reorderingRules.filter((rule) => {
    const matchingBalances = stockBalances.filter(
      (balance) =>
        balance.productId === rule.productId &&
        (!rule.locationId || balance.locationId === rule.locationId) &&
        (!rule.warehouseId ||
          balance.location.warehouseId === rule.warehouseId),
    );
    const freeToUse = matchingBalances.reduce(
      (sum, balance) =>
        sum + Number(balance.quantity) - Number(balance.reservedQuantity),
      0,
    );
    return freeToUse <= Number(rule.minimumQuantity);
  }).length;
  const lowStock = reorderingRules.length ? ruleLowStock : fallbackLowStock;
  const outOfStock = stockBalances.filter((balance) => {
    return Number(balance.quantity) - Number(balance.reservedQuantity) <= 0;
  }).length;

  return {
    overview: {
      products: totalProducts,
      warehouses: totalWarehouses,
      locations: totalLocations,
      stockItems: totalStockItems,
      totalOnHand: onHand,
      totalReserved: reserved,
      freeToUse: Math.max(onHand - reserved, 0),
      lowStock,
      outOfStock,
    },
    receipts: {
      pending: pendingReceipts,
      late: lateReceipts,
    },
    deliveries: {
      pending: pendingDeliveries,
      late: lateDeliveries,
    },
    recentOperations,
  };
};

module.exports = {
  getDashboardSummary,
};
