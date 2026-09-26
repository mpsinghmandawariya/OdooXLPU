const express = require("express");

const warehouseController = require("./warehouse.controller");
const { authenticate } = require("../../middleware/auth.middleware");
const {
  createWarehouseSchema,
  updateWarehouseSchema,
} = require("../../validators/inventoryValidator");

const router = express.Router();

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return res.status(400).json({
      success: false,
      message: firstIssue.message,
    });
  }

  req.validatedBody = result.data;
  next();
};

router.use(authenticate);
router.get("/", warehouseController.getWarehouses);
router.get("/:id", warehouseController.getWarehouseById);
router.post(
  "/",
  validate(createWarehouseSchema),
  warehouseController.createWarehouse,
);
router.put(
  "/:id",
  validate(updateWarehouseSchema),
  warehouseController.updateWarehouse,
);
router.delete("/:id", warehouseController.deleteWarehouse);

module.exports = router;
