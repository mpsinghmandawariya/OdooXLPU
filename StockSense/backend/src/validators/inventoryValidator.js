const { z } = require("zod");

const createProductSchema = z.object({
  sku: z.string().trim().min(3).max(64),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).nullable().optional(),
  categoryId: z.string().trim().min(1),
  unitOfMeasure: z.string().trim().min(1).max(30),
  unitPrice: z.coerce.number().positive(),
});

const updateProductSchema = z.object({
  sku: z.string().trim().min(3).max(64).optional(),
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  categoryId: z.string().trim().min(1).optional(),
  unitOfMeasure: z.string().trim().min(1).max(30).optional(),
  unitPrice: z.coerce.number().positive().optional(),
  isActive: z.boolean().optional(),
});

const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(1000).nullable().optional(),
  isActive: z.boolean().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  isActive: z.boolean().optional(),
});

const adjustStockSchema = z.object({
  productId: z.string().trim().min(1),
  locationId: z.string().trim().min(1),
  quantity: z.coerce.number(),
});

const createWarehouseSchema = z.object({
  code: z.string().trim().min(2).max(30),
  name: z.string().trim().min(2).max(120),
  location: z.string().trim().max(200).nullable().optional(),
});

const updateWarehouseSchema = z.object({
  code: z.string().trim().min(2).max(30).optional(),
  name: z.string().trim().min(2).max(120).optional(),
  location: z.string().trim().max(200).nullable().optional(),
  isActive: z.boolean().optional(),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  createCategorySchema,
  updateCategorySchema,
  adjustStockSchema,
  createWarehouseSchema,
  updateWarehouseSchema,
};
