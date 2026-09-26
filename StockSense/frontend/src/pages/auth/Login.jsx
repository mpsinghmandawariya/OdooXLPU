import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
  ArrowRight,
  Boxes,
  Warehouse,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login: setAuthUser } = useAuth();

  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name] || errors.general) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
        general: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.loginId.trim()) {
      newErrors.loginId = "Please enter your login ID or email";
    }

    if (!formData.password) {
      newErrors.password = "Please enter your password";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", formData);
      const token = response?.data?.data?.token || response?.data?.token;
      const user = response?.data?.data?.user || response?.data?.user;

      if (token) {
        localStorage.setItem("stocksense_token", token);
      }

      if (user) {
        await setAuthUser(user);
      }

      navigate("/dashboard");
    } catch (error) {
      const message =
        error?.response?.data?.message || "Invalid login ID/email or password";

      setErrors({
        general: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F8FB]">
      {/* Top Navigation */}
      <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-6 sm:px-10 lg:px-16">
        {/* Logo */}
        <Link to="/login" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E85D5D] shadow-sm">
            <Boxes className="h-5 w-5 text-white" />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight text-[#172033]">
              Stock<span className="text-[#E85D5D]">Sense</span>
            </h1>

            <p className="hidden text-[10px] font-medium uppercase tracking-[0.15em] text-gray-400 sm:block">
              Inventory Management
            </p>
          </div>
        </Link>

        {/* Right side */}
        <div className="hidden items-center gap-2 text-sm text-gray-500 sm:flex">
          <span className="h-2 w-2 rounded-full bg-green-500"></span>
          System Online
        </div>
      </header>

      {/* Main Content */}
      <section className="flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-10 sm:px-8">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_20px_60px_rgba(23,32,51,0.08)] lg:grid-cols-[1fr_0.9fr]">
          {/* LEFT - Product Information */}
          <div className="relative hidden overflow-hidden bg-[#FFF4F2] p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
            {/* Decorative shapes */}
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#E85D5D]/10"></div>

            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#E85D5D]/5"></div>

            <div className="relative z-10">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#E85D5D]/20 bg-white px-3 py-1.5 text-xs font-medium text-[#C94A4A]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E85D5D]"></span>
                Smart Inventory Platform
              </div>

              <h2 className="max-w-md text-4xl font-bold leading-tight tracking-tight text-[#172033] xl:text-5xl">
                Manage your
                <span className="block text-[#E85D5D]">inventory smarter.</span>
              </h2>

              <p className="mt-5 max-w-md text-base leading-7 text-[#667085]">
                Keep your products, warehouses and stock operations organized
                from one simple platform.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="relative z-10 mt-12 space-y-4">
              <Feature
                icon={<Boxes size={19} />}
                title="Real-time inventory"
                description="Know exactly what is available."
              />

              <Feature
                icon={<Warehouse size={19} />}
                title="Multi-warehouse"
                description="Track stock across locations."
              />

              <Feature
                icon={<BarChart3 size={19} />}
                title="Operational insights"
                description="Monitor your inventory activity."
              />
            </div>

            <div className="relative z-10 mt-10 text-xs text-gray-400">
              © 2026 StockSense
            </div>
          </div>

          {/* RIGHT - Login */}
          <div className="flex items-center p-7 sm:p-10 lg:p-12 xl:p-16">
            <div className="mx-auto w-full max-w-md">
              {/* Mobile Logo */}
              <div className="mb-10 flex items-center gap-3 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E85D5D]">
                  <Boxes className="h-5 w-5 text-white" />
                </div>

                <span className="text-xl font-bold text-[#172033]">
                  Stock<span className="text-[#E85D5D]">Sense</span>
                </span>
              </div>

              {/* Heading */}
              <div className="mb-8">
                <p className="mb-2 text-sm font-semibold text-[#E85D5D]">
                  Welcome back
                </p>

                <h2 className="text-3xl font-bold tracking-tight text-[#172033] sm:text-4xl">
                  Sign in to StockSense
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Enter your credentials to access your inventory dashboard.
                </p>
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500"></div>

                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Login ID / Email */}
                <div>
                  <label
                    htmlFor="loginId"
                    className="mb-2 block text-sm font-semibold text-[#344054]"
                  >
                    Login ID or Email
                  </label>

                  <div className="relative">
                    <UserRound
                      size={18}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                        errors.loginId ? "text-red-400" : "text-gray-400"
                      }`}
                    />

                    <input
                      id="loginId"
                      name="loginId"
                      type="text"
                      value={formData.loginId}
                      onChange={handleChange}
                      placeholder="Enter your login ID or email"
                      autoComplete="username"
                      className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-4 text-sm text-[#172033] shadow-sm outline-none transition-all placeholder:text-gray-400 ${
                        errors.loginId
                          ? "border-red-400 ring-4 ring-red-50"
                          : "border-gray-200 hover:border-gray-300 focus:border-[#E85D5D] focus:ring-4 focus:ring-[#E85D5D]/10"
                      }`}
                    />
                  </div>

                  {errors.loginId && (
                    <p className="mt-2 text-xs font-medium text-red-500">
                      {errors.loginId}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-sm font-semibold text-[#344054]"
                    >
                      Password
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-[#E85D5D] transition hover:text-[#C94A4A]"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                        errors.password ? "text-red-400" : "text-gray-400"
                      }`}
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-12 text-sm text-[#172033] shadow-sm outline-none transition-all placeholder:text-gray-400 ${
                        errors.password
                          ? "border-red-400 ring-4 ring-red-50"
                          : "border-gray-200 hover:border-gray-300 focus:border-[#E85D5D] focus:ring-4 focus:ring-[#E85D5D]/10"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#172033]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="mt-2 text-xs font-medium text-red-500">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Remember */}
                <div className="flex items-center gap-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 accent-[#E85D5D]"
                  />

                  <label htmlFor="remember" className="text-sm text-gray-500">
                    Keep me signed in
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#E85D5D] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#E85D5D]/20 transition-all hover:bg-[#D94F4F] hover:shadow-xl hover:shadow-[#E85D5D]/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-200"></div>

                <span className="text-xs text-gray-400">OR</span>

                <div className="h-px flex-1 bg-gray-200"></div>
              </div>

              {/* Signup */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
                <p className="text-sm text-gray-500">
                  Don't have a StockSense account?
                </p>

                <Link
                  to="/signup"
                  className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-[#E85D5D] hover:text-[#C94A4A]"
                >
                  Create an account
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* Security */}
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                <CheckCircle2 size={14} className="text-green-500" />

                <span>Your information is securely protected</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

const Feature = ({ icon, title, description }) => {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white bg-white/70 p-4 shadow-sm backdrop-blur">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF0EE] text-[#E85D5D]">
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-bold text-[#172033]">{title}</h3>

        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
};

export default Login;
