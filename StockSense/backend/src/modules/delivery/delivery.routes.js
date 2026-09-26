const express = require("express");
const { z } = require("zod");

const deliveryController = require("./delivery.controller");
const { authenticate } = require("../../middleware/auth.middleware");
const validationMiddleware = require("../../middleware/validation.middleware");

const createDeliverySchema = z.object({
  productId: z.string().trim().min(1),
  locationId: z.string().trim().min(1),
  warehouseId: z.string().trim().min(1).optional(),
  quantity: z.coerce.number().positive(),
  unitCost: z.coerce.number().nonnegative().optional(),
  contact: z.string().trim().max(200).optional(),
  referenceNumber: z.string().trim().min(1).max(80).optional(),
  notes: z.string().trim().max(500).nullable().optional(),
  scheduledDate: z
    .union([z.string().datetime({ offset: true }), z.string().date(), z.date()])
    .optional(),
  status: z.enum(["DRAFT", "COMPLETED"]).optional(),
});

const router = express.Router();

router.use(authenticate);
router.get("/next-reference", deliveryController.getNextReference);
router.get("/", deliveryController.getDeliveries);
router.get("/:id", deliveryController.getDeliveryById);
router.post(
  "/",
  validationMiddleware(createDeliverySchema),
  deliveryController.createDelivery,
);
router.post("/:id/ready", deliveryController.markDeliveryReady);
router.post("/:id/validate", deliveryController.validateDelivery);
router.post("/:id/cancel", deliveryController.cancelDelivery);

module.exports = router;
