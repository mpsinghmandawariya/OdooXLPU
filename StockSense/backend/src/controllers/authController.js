const crypto = require("crypto");
const bcrypt = require("bcrypt");

const { signToken } = require("../utils/jwt");
const prisma = require("../config/database");

const normalizeEmail = (email) => email.trim().toLowerCase();
const normalizeLoginId = (loginId) => loginId.trim().toLowerCase();

const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

const signup = async (req, res, next) => {
  try {
    const { loginId, email, password } = req.validatedBody;
    const normalizedLoginId = normalizeLoginId(loginId);
    const normalizedEmail = normalizeEmail(email);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ loginId: normalizedLoginId }, { email: normalizedEmail }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Login ID or email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        loginId: normalizedLoginId,
        email: normalizedEmail,
        passwordHash,
      },
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user.id,
        loginId: user.loginId,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { loginId, password } = req.validatedBody;
    const identifier = String(loginId || "").trim();
    const normalizedIdentifier = identifier.toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { loginId: identifier },
          { loginId: normalizedIdentifier },
          { email: normalizedIdentifier },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid login ID/email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid login ID/email or password",
      });
    }

    const token = signToken({
      userId: user.id,
      loginId: user.loginId,
      role: user.role,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          loginId: user.loginId,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.validatedBody;
    const normalizedEmail = normalizeEmail(email);

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists for this email, a verification code has been sent.",
      });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.passwordResetOTP.deleteMany({
      where: { userId: user.id },
    });

    await prisma.passwordResetOTP.create({
      data: {
        userId: user.id,
        otpHash,
        expiresAt,
      },
    });

    const response = {
      success: true,
      message:
        "If an account exists for this email, a verification code has been sent.",
    };

    if (process.env.NODE_ENV !== "production") {
      response.data = {
        email: normalizedEmail,
        otp,
      };
    }

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.validatedBody;
    const normalizedEmail = normalizeEmail(email);

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const resetOtp = await prisma.passwordResetOTP.findFirst({
      where: {
        userId: user.id,
        used: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!resetOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    if (new Date(resetOtp.expiresAt).getTime() < Date.now()) {
      await prisma.passwordResetOTP.update({
        where: { id: resetOtp.id },
        data: { used: true },
      });

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    const isOtpValid = await bcrypt.compare(otp, resetOtp.otpHash);

    if (!isOtpValid) {
      const nextAttempts = (resetOtp.attempts || 0) + 1;
      const shouldLock = nextAttempts >= 5;

      await prisma.passwordResetOTP.update({
        where: { id: resetOtp.id },
        data: {
          attempts: nextAttempts,
          used: shouldLock,
        },
      });

      return res.status(400).json({
        success: false,
        message: shouldLock
          ? "Too many invalid attempts. Please request a new OTP."
          : "Invalid or expired OTP",
      });
    }

    await prisma.passwordResetOTP.update({
      where: { id: resetOtp.id },
      data: {
        attempts: (resetOtp.attempts || 0) + 1,
      },
    });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.validatedBody;
    const normalizedEmail = normalizeEmail(email);

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset request",
      });
    }

    const resetOtp = await prisma.passwordResetOTP.findFirst({
      where: {
        userId: user.id,
        used: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!resetOtp || new Date(resetOtp.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    const isOtpValid = await bcrypt.compare(otp, resetOtp.otpHash);

    if (!isOtpValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.passwordResetOTP.update({
        where: { id: resetOtp.id },
        data: {
          used: true,
          attempts: (resetOtp.attempts || 0) + 1,
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
};

module.exports = {
  signup,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getMe,
};
