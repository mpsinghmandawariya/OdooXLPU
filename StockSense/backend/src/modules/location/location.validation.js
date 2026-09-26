const { z } = require("zod");

const createLocationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Location name must be at least 2 characters")
    .max(100, "Location name cannot exceed 100 characters"),

  shortCode: z
    .string()
    .trim()
    .min(2, "Short code must be at least 2 characters")
    .max(20, "Short code cannot exceed 20 characters")
    .regex(
      /^[A-Za-z0-9_-]+$/,
      "Short code can contain only letters, numbers, - and _",
    ),

  warehouseId: z.string().uuid("Invalid warehouse ID"),
});

const updateLocationSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),

    shortCode: z
      .string()
      .trim()
      .min(2)
      .max(20)
      .regex(/^[A-Za-z0-9_-]+$/, "Invalid short code")
      .optional(),

    warehouseId: z.string().uuid("Invalid warehouse ID").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

module.exports = {
  createLocationSchema,
  updateLocationSchema,
};
