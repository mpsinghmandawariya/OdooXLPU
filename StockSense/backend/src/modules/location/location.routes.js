const express = require("express");

const locationController = require("./location.controller");
const validationMiddleware = require("../../middleware/validation.middleware");
const { authenticate } = require("../../middleware/auth.middleware");
const {
  createLocationSchema,
  updateLocationSchema,
} = require("./location.validation");

const router = express.Router();

router.post(
  "/",
  authenticate,
  validationMiddleware(createLocationSchema),
  locationController.create,
);
router.get("/", authenticate, locationController.getAll);
router.get("/:id", authenticate, locationController.getOne);
router.put(
  "/:id",
  authenticate,
  validationMiddleware(updateLocationSchema),
  locationController.update,
);
router.delete("/:id", authenticate, locationController.remove);

module.exports = router;
