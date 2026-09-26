import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

import api from "../../services/api";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    loginId: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.loginId.trim()) {
      newErrors.loginId = "Login ID is required";
    } else if (formData.loginId.length < 6 || formData.loginId.length > 12) {
      newErrors.loginId = "Login ID must be 6–12 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must contain at least 8 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Password needs an uppercase letter";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "Password needs a lowercase letter";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Password needs a number";
    } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
      newErrors.password = "Password needs a special character";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await api.post("/auth/signup", {
        loginId: formData.loginId.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      navigate("/login");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Unable to create account. Please try again.";

      setErrors({
        general: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F8FB]">
      <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-6 sm:px-10 lg:px-16">
        <Link to="/login" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E85D5D]">
            <Boxes className="h-5 w-5 text-white" />
          </div>

          <div>
            <h1 className="text-lg font-bold text-[#172033]">
              Stock<span className="text-[#E85D5D]">Sense</span>
            </h1>

            <p className="hidden text-[10px] font-medium uppercase tracking-[0.15em] text-gray-400 sm:block">
              Inventory Management
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 text-sm text-gray-500 sm:flex">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          System Online
        </div>
      </header>

      <section className="flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-10">
        <div className="w-full max-w-xl rounded-[28px] border border-gray-200 bg-white p-7 shadow-[0_20px_60px_rgba(23,32,51,0.08)] sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0EE]">
              <UserRound className="text-[#E85D5D]" size={25} />
            </div>

            <p className="text-sm font-semibold text-[#E85D5D]">Get started</p>

            <h2 className="mt-1 text-3xl font-bold tracking-tight text-[#172033]">
              Create your account
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Set up your StockSense account to manage inventory.
            </p>
          </div>

          {errors.general && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#344054]">
                Login ID
              </label>

              <div className="relative">
                <UserRound
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  name="loginId"
                  value={formData.loginId}
                  onChange={handleChange}
                  placeholder="Choose your Login ID"
                  className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition ${
                    errors.loginId
                      ? "border-red-400 ring-4 ring-red-50"
                      : "border-gray-200 focus:border-[#E85D5D] focus:ring-4 focus:ring-[#E85D5D]/10"
                  }`}
                />
              </div>

              {errors.loginId && (
                <p className="mt-1.5 text-xs text-red-500">{errors.loginId}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#344054]">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition ${
                    errors.email
                      ? "border-red-400 ring-4 ring-red-50"
                      : "border-gray-200 focus:border-[#E85D5D] focus:ring-4 focus:ring-[#E85D5D]/10"
                  }`}
                />
              </div>

              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#344054]">
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-12 text-sm outline-none transition ${
                    errors.password
                      ? "border-red-400 ring-4 ring-red-50"
                      : "border-gray-200 focus:border-[#E85D5D] focus:ring-4 focus:ring-[#E85D5D]/10"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#344054]">
                Confirm Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-12 text-sm outline-none transition ${
                    errors.confirmPassword
                      ? "border-red-400 ring-4 ring-red-50"
                      : "border-gray-200 focus:border-[#E85D5D] focus:ring-4 focus:ring-[#E85D5D]/10"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#E85D5D] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#E85D5D]/20 transition hover:bg-[#D94F4F] disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="mt-7 border-t border-gray-200 pt-6 text-center">
            <p className="text-sm text-gray-500">Already have an account?</p>

            <Link
              to="/login"
              className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-[#E85D5D]"
            >
              Sign in
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-6 flex justify-center gap-2 text-xs text-gray-400">
            <CheckCircle2 size={14} className="text-green-500" />
            Your account information is securely protected
          </div>
        </div>
      </section>
    </main>
  );
};

export default Signup;
