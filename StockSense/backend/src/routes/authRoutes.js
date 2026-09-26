const express = require("express");
const {
  signup,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getMe,
} = require("../controllers/authController");
const {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} = require("../validators/authValidator");
const { authenticate } = require("../middleware/auth.middleware");
const validationMiddleware = require("../middleware/validation.middleware");

const router = express.Router();

router.post("/signup", validationMiddleware(signupSchema), signup);
router.post("/login", validationMiddleware(loginSchema), login);
router.post("/forgot-password", validationMiddleware(forgotPasswordSchema), forgotPassword);
router.post("/verify-otp", validationMiddleware(verifyOtpSchema), verifyOtp);
router.post("/reset-password", validationMiddleware(resetPasswordSchema), resetPassword);
router.get("/me", authenticate, getMe);

module.exports = router;
