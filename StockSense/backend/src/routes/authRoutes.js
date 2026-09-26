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

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.get("/me", authenticate, getMe);

module.exports = router;
