const express = require("express");

const productController = require("./product.controller");
const { authenticate } = require("../../middleware/auth.middleware");
const {
  createProductSchema,
  updateProductSchema,
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
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);
router.post(
  "/",
  validate(createProductSchema),
  productController.createProduct,
);
router.put(
  "/:id",
  validate(updateProductSchema),
  productController.updateProduct,
);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
