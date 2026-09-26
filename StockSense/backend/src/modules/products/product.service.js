const prisma = require("../../config/database");

class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

const normalizeProduct = (product) => ({
  ...product,
  unitPrice: Number(product.unitPrice),
});

const getProducts = async (query = {}) => {
  const where = {};

  if (query.isActive !== undefined) {
    where.isActive = query.isActive === "true" || query.isActive === true;
  }

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  if (query.search) {
    const search = query.search.trim();
    where.OR = [
      { name: { contains: search } },
      { sku: { contains: search } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return products.map(normalizeProduct);
};

const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return normalizeProduct(product);
};

const createProduct = async (payload) => {
  const sku = payload.sku.trim();
  const name = payload.name.trim();
  const description = payload.description?.trim() || null;
  const categoryId = payload.categoryId;
  const unitOfMeasure = payload.unitOfMeasure.trim();

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const existingProduct = await prisma.product.findUnique({
    where: { sku },
  });

  if (existingProduct) {
    throw new AppError("A product with this SKU already exists", 409);
  }

  const product = await prisma.product.create({
    data: {
      sku,
      name,
      description,
      categoryId,
      unitOfMeasure,
      unitPrice: payload.unitPrice,
    },
    include: { category: true },
  });

  return normalizeProduct(product);
};

const updateProduct = async (id, payload) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    throw new AppError("Product not found", 404);
  }

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: payload.categoryId },
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }
  }

  if (payload.sku && payload.sku.trim() !== existingProduct.sku) {
    const duplicateSku = await prisma.product.findUnique({
      where: { sku: payload.sku.trim() },
    });

    if (duplicateSku) {
      throw new AppError("A product with this SKU already exists", 409);
    }
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      sku: payload.sku ? payload.sku.trim() : undefined,
      name: payload.name ? payload.name.trim() : undefined,
      description:
        payload.description === undefined
          ? undefined
          : payload.description?.trim() || null,
      categoryId: payload.categoryId,
      unitOfMeasure: payload.unitOfMeasure
        ? payload.unitOfMeasure.trim()
        : undefined,
      unitPrice: payload.unitPrice,
      isActive: payload.isActive,
    },
    include: { category: true },
  });

  return normalizeProduct(updatedProduct);
};

const deleteProduct = async (id) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    throw new AppError("Product not found", 404);
  }

  const product = await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });

  return normalizeProduct(product);
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
