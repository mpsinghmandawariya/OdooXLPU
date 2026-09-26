const express = require("express");

const userController = require("./user.controller");
const { authenticate } = require("../../middleware/auth.middleware");
const validationMiddleware = require("../../middleware/validation.middleware");
const { z } = require("zod");

const router = express.Router();

const updateProfileSchema = z.object({
  email: z.string().email().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

router.get("/me", authenticate, userController.getMe);
router.put(
  "/me",
  authenticate,
  validationMiddleware(updateProfileSchema),
  userController.updateMe,
);
router.put(
  "/change-password",
  authenticate,
  validationMiddleware(changePasswordSchema),
  userController.changePassword,
);

module.exports = router;
