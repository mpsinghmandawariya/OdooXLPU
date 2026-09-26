const { z } = require('zod')

const signupSchema = z
  .object({
    loginId: z
      .string()
      .trim()
      .min(6, 'Login ID must be at least 6 characters')
      .max(12, 'Login ID must be at most 12 characters'),
    email: z.string().trim().email('Please provide a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must include at least one uppercase character')
      .regex(/[a-z]/, 'Password must include at least one lowercase character')
      .regex(/[0-9]/, 'Password must include at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must include at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

const loginSchema = z.object({
  loginId: z.string().trim().min(1, 'Login ID is required'),
  password: z.string().min(1, 'Password is required'),
})

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address'),
})

const verifyOtpSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address'),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'OTP must be a 6-digit number'),
})

const resetPasswordSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address'),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'OTP must be a 6-digit number'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must include at least one uppercase character')
    .regex(/[a-z]/, 'Password must include at least one lowercase character')
    .regex(/[0-9]/, 'Password must include at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must include at least one special character'),
})

module.exports = {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
}
