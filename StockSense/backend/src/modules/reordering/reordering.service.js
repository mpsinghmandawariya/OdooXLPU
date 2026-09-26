const prisma = require("../../config/database");
const { AppError } = require("../../utils/errors");

const getStockForRule = async (rule) => {
  const where = { productId: rule.productId };
  if (rule.locationId) where.locationId = rule.locationId;
  else if (rule.warehouseId) where.location = { warehouseId: rule.warehouseId };

  const balances = await prisma.stockBalance.findMany({
    where,
    select: { quantity: true, reservedQuantity: true },
  });
  const onHand = balances.reduce(
    (sum, balance) => sum + Number(balance.quantity),
    0,
  );
  const reserved = balances.reduce(
    (sum, balance) => sum + Number(balance.reservedQuantity),
    0,
  );
  return { onHand, reserved, freeToUse: onHand - reserved };
};

const formatRule = async (rule) => {
  const stock = await getStockForRule(rule);
  const minimum = Number(rule.minimumQuantity);
  const maximum = Number(rule.maximumQuantity);
  const reorder = Number(rule.reorderQuantity);
  const needsReorder = stock.freeToUse <= minimum;
  return {
    ...rule,
    minimumQuantity: minimum,
    maximumQuantity: maximum,
    reorderQuantity: reorder,
    stock,
    needsReorder,
    suggestedOrderQuantity: needsReorder
      ? Math.max(0, maximum - stock.freeToUse)
      : 0,
  };
};

const validateScope = async ({ productId, warehouseId, locationId }) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError("Product not found", 404);

  if (warehouseId) {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId },
    });
    if (!warehouse) throw new AppError("Warehouse not found", 404);
  }

  if (locationId) {
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });
    if (!location) throw new AppError("Location not found", 404);
    if (warehouseId && location.warehouseId !== warehouseId) {
      throw new AppError("Location does not belong to the selected warehouse", 400);
    }
  }
};

const getRules = async ({
  productId,
  warehouseId,
  locationId,
  isActive = true,
} = {}) => {
  const rules = await prisma.reorderingRule.findMany({
    where: {
      ...(productId ? { productId } : {}),
      ...(warehouseId ? { warehouseId } : {}),
      ...(locationId ? { locationId } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    },
    include: {
      product: {
        select: { id: true, name: true, sku: true, unitOfMeasure: true },
      },
      warehouse: { select: { id: true, name: true, code: true } },
      location: {
        select: { id: true, name: true, shortCode: true, warehouseId: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return Promise.all(rules.map(formatRule));
};

const getRuleById = async (id) => {
  const rule = await prisma.reorderingRule.findUnique({
    where: { id },
    include: { product: true, warehouse: true, location: true },
  });
  if (!rule) throw new AppError("Reordering rule not found", 404);
  return formatRule(rule);
};

const createRule = async (payload) => {
  await validateScope(payload);
  const existing = await prisma.reorderingRule.findFirst({
    where: {
      productId: payload.productId,
      warehouseId: payload.warehouseId || null,
      locationId: payload.locationId || null,
      isActive: true,
    },
  });
  if (existing)
    throw new AppError(
      "An active reordering rule already exists for this scope",
      409,
    );
  const rule = await prisma.reorderingRule.create({
    data: {
      ...payload,
      warehouseId: payload.warehouseId || null,
      locationId: payload.locationId || null,
    },
    include: { product: true, warehouse: true, location: true },
  });
  return formatRule(rule);
};

const updateRule = async (id, payload) => {
  const existing = await prisma.reorderingRule.findUnique({ where: { id } });
  if (!existing) throw new AppError("Reordering rule not found", 404);
  await validateScope({
    productId: payload.productId || existing.productId,
    warehouseId:
      payload.warehouseId === undefined
        ? existing.warehouseId
        : payload.warehouseId,
    locationId:
      payload.locationId === undefined
        ? existing.locationId
        : payload.locationId,
  });
  const rule = await prisma.reorderingRule.update({
    where: { id },
    data: payload,
    include: { product: true, warehouse: true, location: true },
  });
  return formatRule(rule);
};

const deactivateRule = async (id) => {
  try {
    return await prisma.reorderingRule.update({
      where: { id },
      data: { isActive: false },
    });
  } catch {
    throw new AppError("Reordering rule not found", 404);
  }
};

module.exports = {
  getRules,
  getRuleById,
  createRule,
  updateRule,
  deactivateRule,
};
