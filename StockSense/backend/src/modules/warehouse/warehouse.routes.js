const express = require("express");

const warehouseController = require("./warehouse.controller");
const validationMiddleware = require("../../middleware/validation.middleware");
const { authenticate } = require("../../middleware/auth.middleware");
const {
  createWarehouseSchema,
  updateWarehouseSchema,
} = require("./warehouse.validation");

const router = express.Router();

router.post(
  "/",
  authenticate,
  validationMiddleware(createWarehouseSchema),
  warehouseController.create,
);
router.get("/", authenticate, warehouseController.getAll);
router.get("/:id", authenticate, warehouseController.getOne);
router.put(
  "/:id",
  authenticate,
  validationMiddleware(updateWarehouseSchema),
  warehouseController.update,
);
router.delete("/:id", authenticate, warehouseController.remove);

module.exports = router;
