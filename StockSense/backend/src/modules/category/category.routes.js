const express = require("express");

const categoryController = require("./category.controller");
const { authenticate } = require("../../middleware/auth.middleware");
const validationMiddleware = require("../../middleware/validation.middleware");
const {
  createCategorySchema,
  updateCategorySchema,
} = require("../../validators/inventoryValidator");

const router = express.Router();

router.use(authenticate);
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);
router.post(
  "/",
  validationMiddleware(createCategorySchema),
  categoryController.createCategory,
);
router.put(
  "/:id",
  validationMiddleware(updateCategorySchema),
  categoryController.updateCategory,
);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
