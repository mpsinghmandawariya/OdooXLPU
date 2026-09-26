const express = require("express");
const controller = require("./reordering.controller");
const { authenticate } = require("../../middleware/auth.middleware");
const validationMiddleware = require("../../middleware/validation.middleware");
const {
  createReorderingRuleSchema,
  updateReorderingRuleSchema,
} = require("../../validators/reorderingValidator");

const router = express.Router();
router.use(authenticate);
router.get("/", controller.getRules);
router.get("/:id", controller.getRule);
router.post(
  "/",
  validationMiddleware(createReorderingRuleSchema),
  controller.createRule,
);
router.put(
  "/:id",
  validationMiddleware(updateReorderingRuleSchema),
  controller.updateRule,
);
router.delete("/:id", controller.deactivateRule);
module.exports = router;
