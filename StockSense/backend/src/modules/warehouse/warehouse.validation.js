const { z } = require("zod");

const createWarehouseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Warehouse name must be at least 2 characters")
    .max(100, "Warehouse name cannot exceed 100 characters"),

  code: z
    .string()
    .trim()
    .min(2, "Short code must be at least 2 characters")
    .max(20, "Short code cannot exceed 20 characters")
    .regex(
      /^[A-Za-z0-9_-]+$/,
      "Short code can contain only letters, numbers, hyphens and underscores",
    ),

  address: z
    .string()
    .trim()
    .max(300, "Address cannot exceed 300 characters")
    .optional()
    .or(z.literal("")),
});

const updateWarehouseSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),

    code: z
      .string()
      .trim()
      .min(2)
      .max(20)
      .regex(/^[A-Za-z0-9_-]+$/, "Invalid warehouse short code")
      .optional(),

    address: z.string().trim().max(300).optional().or(z.literal("")),

    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

module.exports = {
  createWarehouseSchema,
  updateWarehouseSchema,
};
