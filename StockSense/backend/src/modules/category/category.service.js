const prisma = require("../../config/database");

class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

const getCategories = async (query = {}) => {
  const where = {};

  if (query.isActive !== undefined) {
    where.isActive = query.isActive === "true" || query.isActive === true;
  }

  if (query.search) {
    const search = query.search.trim();
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  return prisma.category.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
};

const getCategoryById = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { products: true },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
};

const createCategory = async (payload) => {
  const name = payload.name.trim();

  const existing = await prisma.category.findUnique({
    where: { name },
  });

  if (existing) {
    throw new AppError("A category with this name already exists", 409);
  }

  return prisma.category.create({
    data: {
      name,
      description: payload.description?.trim() || null,
      isActive: payload.isActive ?? true,
    },
  });
};

const updateCategory = async (id, payload) => {
  const existing = await prisma.category.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError("Category not found", 404);
  }

  if (payload.name && payload.name.trim() !== existing.name) {
    const duplicate = await prisma.category.findUnique({
      where: { name: payload.name.trim() },
    });

    if (duplicate) {
      throw new AppError("A category with this name already exists", 409);
    }
  }

  return prisma.category.update({
    where: { id },
    data: {
      name: payload.name ? payload.name.trim() : undefined,
      description:
        payload.description === undefined
          ? undefined
          : payload.description?.trim() || null,
      isActive: payload.isActive,
    },
  });
};

const deleteCategory = async (id) => {
  const existing = await prisma.category.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError("Category not found", 404);
  }

  const productCount = await prisma.product.count({
    where: { categoryId: id },
  });

  if (productCount > 0) {
    throw new AppError(
      "This category is in use by products and cannot be deleted",
      409,
    );
  }

  return prisma.category.update({
    where: { id },
    data: { isActive: false },
  });
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
