import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import api from "../../services/api";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) {
      setErrors({ email: "Email is required" });
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: "Enter a valid email address" });
      return false;
    }

    return true;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!validateEmail()) return;

    setIsLoading(true);

    try {
      await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      setStep(2);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Unable to send OTP. Please try again.";

      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setErrors({ otp: "Enter the 6-digit OTP" });
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/auth/verify-otp", {
        email: email.trim().toLowerCase(),
        otp,
      });

      setStep(3);
    } catch (error) {
      const message =
        error?.response?.data?.message || "Invalid or expired OTP";

      setErrors({ otp: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (password.length < 8) {
      newErrors.password = "Password must contain at least 8 characters";
    }

    if (!/[A-Z]/.test(password)) {
      newErrors.password = "Password needs an uppercase letter";
    }

    if (!/[a-z]/.test(password)) {
      newErrors.password = "Password needs a lowercase letter";
    }

    if (!/[0-9]/.test(password)) {
      newErrors.password = "Password needs a number";
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      newErrors.password = "Password needs a special character";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/auth/reset-password", {
        email: email.trim().toLowerCase(),
        otp,
        password,
      });

      setStep(4);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Unable to reset password. Please try again.";

      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F8FB]">
      <header className="flex h-20 items-center border-b border-gray-200 bg-white px-6 sm:px-10 lg:px-16">
        <Link to="/login" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E85D5D]">
            <Boxes className="h-5 w-5 text-white" />
          </div>

          <div>
            <h1 className="text-lg font-bold text-[#172033]">
              Stock<span className="text-[#E85D5D]">Sense</span>
            </h1>

            <p className="hidden text-[10px] uppercase tracking-[0.15em] text-gray-400 sm:block">
              Inventory Management
            </p>
          </div>
        </Link>
      </header>

      <section className="flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          {step < 4 && (
            <Link
              to="/login"
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#172033]"
            >
              <ArrowLeft size={16} />
              Back to login
            </Link>
          )}

          <div className="rounded-[28px] border border-gray-200 bg-white p-7 shadow-[0_20px_60px_rgba(23,32,51,0.08)] sm:p-9">
            {step === 1 && (
              <>
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0EE]">
                    <KeyRound className="text-[#E85D5D]" />
                  </div>

                  <h2 className="text-3xl font-bold text-[#172033]">
                    Forgot password?
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    Enter the email associated with your account and we'll send
                    you a verification code.
                  </p>
                </div>

                {errors.general && <ErrorMessage message={errors.general} />}

                <form onSubmit={handleSendOtp}>
                  <label className="mb-2 block text-sm font-semibold text-[#344054]">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors({});
                      }}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-gray-200 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#E85D5D] focus:ring-4 focus:ring-[#E85D5D]/10"
                    />
                  </div>

                  {errors.email && (
                    <p className="mt-2 text-xs text-red-500">{errors.email}</p>
                  )}

                  <button
                    disabled={isLoading}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E85D5D] py-3.5 text-sm font-bold text-white hover:bg-[#D94F4F] disabled:opacity-60"
                  >
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                    {!isLoading && <ArrowRight size={17} />}
                  </button>
                </form>
              </>
            )}

            {step === 2 && (
              <>
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0EE]">
                    <ShieldCheck className="text-[#E85D5D]" />
                  </div>

                  <h2 className="text-3xl font-bold text-[#172033]">
                    Verify your email
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    Enter the 6-digit verification code sent to
                    <span className="font-semibold text-gray-700">
                      {" "}
                      {email}
                    </span>
                  </p>
                </div>

                {errors.otp && <ErrorMessage message={errors.otp} />}

                <form onSubmit={handleVerifyOtp}>
                  <label className="mb-2 block text-sm font-semibold text-[#344054]">
                    Verification Code
                  </label>

                  <input
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);

                      setOtp(value);
                      setErrors({});
                    }}
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    className="w-full rounded-xl border border-gray-200 py-4 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-[#E85D5D] focus:ring-4 focus:ring-[#E85D5D]/10"
                  />

                  <button
                    disabled={isLoading}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E85D5D] py-3.5 text-sm font-bold text-white hover:bg-[#D94F4F] disabled:opacity-60"
                  >
                    {isLoading ? "Verifying..." : "Verify OTP"}
                    {!isLoading && <ArrowRight size={17} />}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mt-5 block w-full text-center text-sm font-semibold text-[#E85D5D]"
                >
                  Use a different email
                </button>
              </>
            )}

            {step === 3 && (
              <>
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0EE]">
                    <LockKeyhole className="text-[#E85D5D]" />
                  </div>

                  <h2 className="text-3xl font-bold text-[#172033]">
                    Create new password
                  </h2>

                  <p className="mt-3 text-sm text-gray-500">
                    Choose a strong password for your StockSense account.
                  </p>
                </div>

                {errors.general && <ErrorMessage message={errors.general} />}

                <form onSubmit={handleResetPassword} className="space-y-5">
                  <PasswordField
                    label="New Password"
                    value={password}
                    onChange={setPassword}
                    show={showPassword}
                    setShow={setShowPassword}
                    error={errors.password}
                  />

                  <PasswordField
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    show={showConfirmPassword}
                    setShow={setShowConfirmPassword}
                    error={errors.confirmPassword}
                  />

                  <button
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E85D5D] py-3.5 text-sm font-bold text-white hover:bg-[#D94F4F] disabled:opacity-60"
                  >
                    {isLoading ? "Updating..." : "Reset Password"}
                    {!isLoading && <ArrowRight size={17} />}
                  </button>
                </form>
              </>
            )}

            {step === 4 && (
              <div className="py-5 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                  <CheckCircle2 size={34} className="text-green-500" />
                </div>

                <h2 className="text-3xl font-bold text-[#172033]">
                  Password updated
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Your password has been successfully changed. You can now sign
                  in with your new password.
                </p>

                <Link
                  to="/login"
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E85D5D] py-3.5 text-sm font-bold text-white hover:bg-[#D94F4F]"
                >
                  Continue to Login
                  <ArrowRight size={17} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

const PasswordField = ({ label, value, onChange, show, setShow, error }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#344054]">
        {label}
      </label>

      <div className="relative">
        <LockKeyhole
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-gray-200 py-3.5 pl-11 pr-12 text-sm outline-none focus:border-[#E85D5D] focus:ring-4 focus:ring-[#E85D5D]/10"
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
};

const ErrorMessage = ({ message }) => (
  <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
    {message}
  </div>
);

export default ForgotPassword;
