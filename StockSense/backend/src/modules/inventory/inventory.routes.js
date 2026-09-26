const express = require("express");
const { z } = require("zod");

const controller = require("./inventory.controller");
const validationMiddleware = require("../../middleware/validation.middleware");
const { authenticate } = require("../../middleware/auth.middleware");

const transferSchema = z.object({
  productId: z.string().trim().min(1),
  sourceLocationId: z.string().trim().min(1),
  destinationLocationId: z.string().trim().min(1),
  quantity: z.coerce.number().positive(),
  scheduledDate: z
    .union([z.string().datetime({ offset: true }), z.string().date(), z.date()])
    .optional(),
  contact: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(500).optional(),
});

const adjustmentSchema = z.object({
  productId: z.string().trim().min(1),
  locationId: z.string().trim().min(1),
  quantity: z.coerce.number().min(0),
  notes: z.string().trim().max(500).optional(),
});

const router = express.Router();
router.use(authenticate);

router.post(
  "/transfers",
  validationMiddleware(transferSchema),
  controller.createTransfer,
);
router.get("/transfers/:id", controller.getTransfer);
router.post("/transfers/:id/ready", controller.readyTransfer);
router.post("/transfers/:id/validate", controller.validateTransfer);
router.post("/transfers/:id/cancel", controller.cancelTransfer);

router.post(
  "/adjustments",
  validationMiddleware(adjustmentSchema),
  controller.createAdjustment,
);
router.get("/adjustments/:id", controller.getAdjustment);
router.post("/adjustments/:id/ready", controller.readyAdjustment);
router.post("/adjustments/:id/validate", controller.validateAdjustment);
router.post("/adjustments/:id/cancel", controller.cancelAdjustment);

module.exports = router;
