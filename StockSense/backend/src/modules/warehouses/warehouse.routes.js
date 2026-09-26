const express = require("express");

const warehouseController = require("./warehouse.controller");
const { authenticate } = require("../../middleware/auth.middleware");
const validationMiddleware = require("../../middleware/validation.middleware");
const {
  createWarehouseSchema,
  updateWarehouseSchema,
} = require("../../validators/inventoryValidator");

const router = express.Router();

router.use(authenticate);
router.get("/", warehouseController.getWarehouses);
router.get("/:id", warehouseController.getWarehouseById);
router.post("/", validationMiddleware(createWarehouseSchema), warehouseController.createWarehouse);
router.put("/:id", validationMiddleware(updateWarehouseSchema), warehouseController.updateWarehouse);
router.delete("/:id", warehouseController.deleteWarehouse);

module.exports = router;
