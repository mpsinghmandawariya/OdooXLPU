const { z } = require("zod");

const reorderingRuleFields = {
  productId: z.string().uuid(),
  warehouseId: z.string().uuid().nullable().optional(),
  locationId: z.string().uuid().nullable().optional(),
  minimumQuantity: z.coerce.number().min(0),
  maximumQuantity: z.coerce.number().min(0),
  reorderQuantity: z.coerce.number().positive(),
  isActive: z.boolean().optional().default(true),
};

const validateQuantities = (data, ctx) => {
  if (
    data.maximumQuantity === undefined ||
    data.minimumQuantity === undefined ||
    data.reorderQuantity === undefined
  )
    return;
  if (data.maximumQuantity < data.minimumQuantity) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["maximumQuantity"],
      message:
        "Maximum quantity must be greater than or equal to minimum quantity.",
    });
  }
  if (data.reorderQuantity > data.maximumQuantity) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["reorderQuantity"],
      message: "Reorder quantity cannot be greater than maximum quantity.",
    });
  }
};

const createReorderingRuleSchema = z
  .object(reorderingRuleFields)
  .superRefine(validateQuantities);

const updateReorderingRuleSchema = z
  .object(reorderingRuleFields)
  .partial()
  .superRefine(validateQuantities);

module.exports = { createReorderingRuleSchema, updateReorderingRuleSchema };
