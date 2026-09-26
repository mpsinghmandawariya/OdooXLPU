const express = require("express");

const productController = require("../products/product.controller");
const { authenticate } = require("../../middleware/auth.middleware");
const validationMiddleware = require("../../middleware/validation.middleware");
const {
  createProductSchema,
  updateProductSchema,
} = require("../../validators/inventoryValidator");

const router = express.Router();

router.use(authenticate);
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);
router.post(
  "/",
  validationMiddleware(createProductSchema),
  productController.createProduct,
);
router.put(
  "/:id",
  validationMiddleware(updateProductSchema),
  productController.updateProduct,
);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
