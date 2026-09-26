import {
  AlertCircle,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
  Bell,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  History,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  Truck,
  Warehouse,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { getDashboardSummary } from "../../services/dashboard.service";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const todayLabel = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());
  const [mobileMenu, setMobileMenu] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const data = await getDashboardSummary();
        setDashboard(data);
      } catch (err) {
        console.error(err);

        if (err?.response?.status === 401) {
          localStorage.removeItem("stocksense_token");
          localStorage.removeItem("stocksense_user");
          logout();
          navigate("/login", { replace: true });
          return;
        }

        setError(
          err?.response?.data?.message || "Unable to load dashboard summary.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [logout, navigate]);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Operations", path: "/operations/receipts", icon: ClipboardList },
    { name: "Products", path: "/products", icon: Package },
    { name: "Transfer", path: "/operations/transfers/new", icon: ArrowRight },
    {
      name: "Adjustment",
      path: "/operations/adjustments/new",
      icon: AlertCircle,
    },
    { name: "Settings", path: "/settings", icon: Settings },
    { name: "Stock", path: "/stock", icon: Package },
    { name: "Move History", path: "/move-history", icon: History },
  ];

  const isActive = (path) =>
    path === "/operations/receipts"
      ? location.pathname.startsWith("/operations")
      : location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("stocksense_token");
    localStorage.removeItem("stocksense_user");
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F8FB]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#E85D5D]" />
          <p className="mt-4 text-sm font-medium text-gray-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F8FB] px-5">
        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-[#172033]">
            Unable to load dashboard
          </h2>
          <p className="mt-2 text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-[#172033]">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="flex h-[72px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E85D5D] shadow-sm">
              <Boxes size={21} className="text-white" />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                Stock<span className="text-[#E85D5D]">Sense</span>
              </h1>

              <p className="hidden text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-400 sm:block">
                Inventory Management
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-[#FFF0EE] text-[#E85D5D]"
                      : "text-gray-500 hover:bg-gray-50 hover:text-[#172033]"
                  }`}
                >
                  <Icon size={16} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:bg-gray-50"
              aria-label="Notifications"
            >
              <Bell size={19} />

              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E85D5D] px-1 text-[9px] font-bold text-white">
                4
              </span>
            </button>

            <button className="hidden items-center gap-2 rounded-xl p-1.5 hover:bg-gray-50 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E85D5D] text-xs font-bold text-white">
                M
              </div>

              <ChevronDown size={15} className="text-gray-400" />
            </button>

            <button
              onClick={handleLogout}
              className="hidden rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 sm:inline-flex"
            >
              Logout
            </button>

            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 lg:hidden"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="border-t border-gray-100 bg-white p-3 lg:hidden">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenu(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
                      isActive(item.path)
                        ? "bg-[#FFF0EE] text-[#E85D5D]"
                        : "text-gray-600"
                    }`}
                  >
                    <Icon size={18} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
        <section className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E85D5D]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E85D5D]" />
              Overview
            </div>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Dashboard
            </h2>

            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Overview of your inventory operations.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-500 shadow-sm">
            <Clock3 size={16} />
            <span>Today</span>
            <span className="font-semibold text-[#172033]">{todayLabel}</span>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <OperationCard
            type="receipt"
            title="Receipt"
            subtitle="Incoming inventory"
            count={dashboard.receipts.pending}
            countLabel="Pending"
            late={`${dashboard.receipts.late} Late`}
            operations={`${dashboard.overview.stockItems} Stock Items`}
            icon={<ArrowDownToLine size={22} />}
            onClick={() => navigate("/operations/receipts")}
          />

          <OperationCard
            type="delivery"
            title="Delivery"
            subtitle="Outgoing inventory"
            count={dashboard.deliveries.pending}
            countLabel="Pending"
            late={`${dashboard.deliveries.late} Late`}
            operations={`${dashboard.overview.totalOnHand} On Hand`}
            icon={<ArrowUpFromLine size={22} />}
            onClick={() => navigate("/operations/deliveries")}
          />
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard
            icon={<Package size={19} />}
            label="Total Products"
            value={dashboard.overview.products}
            detail="Across inventory"
          />

          <StatCard
            icon={<Warehouse size={19} />}
            label="Warehouses"
            value={dashboard.overview.warehouses}
            detail="Active locations"
          />

          <StatCard
            icon={<Truck size={19} />}
            label="Pending Deliveries"
            value={dashboard.deliveries.pending}
            detail="Require attention"
          />

          <StatCard
            icon={<CheckCircle2 size={19} />}
            label="Free To Use"
            value={dashboard.overview.freeToUse}
            detail="Units available"
          />

          <StatCard
            icon={<AlertCircle size={19} />}
            label="Low Stock"
            value={dashboard.overview.lowStock}
            detail="Locations to review"
          />

          <StatCard
            icon={<AlertCircle size={19} />}
            label="Out of Stock"
            value={dashboard.overview.outOfStock}
            detail="Locations unavailable"
          />
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h3 className="font-bold text-[#172033]">Recent Operations</h3>
              <p className="mt-1 text-xs text-gray-500">
                Latest inventory movements.
              </p>
            </div>

            <Link
              to="/move-history"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#E85D5D]"
            >
              View history
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Product
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Operation
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {dashboard.recentOperations.length ? (
                  dashboard.recentOperations.map((operation) => (
                    <OperationRow
                      key={operation.id}
                      product={operation.product?.name || "Unknown Product"}
                      operation={operation.type}
                      quantity={
                        operation.type === "RECEIPT" ||
                        operation.type === "ADJUSTMENT"
                          ? `+${Number(operation.quantity)}`
                          : `-${Number(operation.quantity)}`
                      }
                      status={operation.status}
                      date={new Date(operation.createdAt).toLocaleString()}
                      positive={
                        operation.type === "RECEIPT" ||
                        operation.type === "ADJUSTMENT"
                      }
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-sm text-gray-500"
                    >
                      No recent operations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-6 flex flex-col justify-between gap-3 rounded-2xl border border-green-100 bg-green-50/60 px-5 py-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 size={18} className="text-green-600" />
            </div>

            <div>
              <p className="text-sm font-semibold text-green-800">
                All systems operational
              </p>

              <p className="text-xs text-green-600">
                Inventory services are running normally.
              </p>
            </div>
          </div>

          <span className="flex items-center gap-2 text-xs font-medium text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            System Online
          </span>
        </div>
      </main>
    </div>
  );
};

const OperationCard = ({
  type,
  title,
  subtitle,
  count,
  countLabel,
  late,
  waiting,
  operations,
  icon,
  onClick,
}) => {
  const receipt = type === "receipt";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div
        className={`absolute -right-16 -top-16 h-44 w-44 rounded-full ${
          receipt ? "bg-orange-50" : "bg-blue-50"
        }`}
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                receipt
                  ? "bg-orange-50 text-orange-500"
                  : "bg-blue-50 text-blue-500"
              }`}
            >
              {icon}
            </div>

            <div>
              <h3 className="font-bold text-[#172033]">{title}</h3>
              <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
            </div>
          </div>

          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
              receipt
                ? "bg-orange-50 text-orange-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            {receipt ? "Incoming" : "Outgoing"}
          </span>
        </div>

        <div className="mt-7 flex items-end gap-3">
          <span className="text-5xl font-bold tracking-tight text-[#172033]">
            {count}
          </span>

          <span className="mb-1.5 text-sm font-medium text-gray-500">
            {countLabel}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Metric type="danger" icon={<AlertCircle size={13} />} text={late} />

          {waiting && (
            <Metric type="warning" icon={<Clock3 size={13} />} text={waiting} />
          )}

          <Metric
            type="neutral"
            icon={<ClipboardList size={13} />}
            text={operations}
          />
        </div>

        <button
          onClick={onClick}
          className="mt-7 flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition group-hover:border-[#E85D5D]/30 group-hover:bg-[#FFF7F6] group-hover:text-[#E85D5D]"
        >
          <span>View {title}s</span>

          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </button>
      </div>
    </div>
  );
};

const Metric = ({ icon, text, type }) => {
  const styles = {
    danger: "bg-red-50 text-red-600",
    warning: "bg-amber-50 text-amber-600",
    neutral: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${styles[type]}`}
    >
      {icon}
      {text}
    </span>
  );
};

const StatCard = ({ icon, label, value, detail }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF0EE] text-[#E85D5D]">
          {icon}
        </div>

        <span className="h-2 w-2 rounded-full bg-green-500" />
      </div>

      <div className="mt-5">
        <p className="text-xs font-medium text-gray-500">{label}</p>

        <div className="mt-1 flex items-end gap-2">
          <span className="text-2xl font-bold text-[#172033]">{value}</span>
          <span className="mb-1 text-xs text-gray-400">{detail}</span>
        </div>
      </div>
    </div>
  );
};

const OperationRow = ({
  product,
  operation,
  quantity,
  status,
  date,
  positive,
}) => {
  const normalizedStatus = String(status || "").toLowerCase();
  const displayStatus =
    status === "PENDING"
      ? "Pending"
      : status === "COMPLETED"
        ? "Completed"
        : status === "CANCELLED"
          ? "Cancelled"
          : status;

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/70">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
            <Package size={16} className="text-gray-500" />
          </div>

          <span className="text-sm font-semibold text-[#172033]">
            {product}
          </span>
        </div>
      </td>

      <td className="px-6 py-4 text-sm text-gray-500">{operation}</td>

      <td
        className={`px-6 py-4 text-sm font-bold ${
          positive ? "text-green-600" : "text-red-500"
        }`}
      >
        {quantity}
      </td>

      <td className="px-6 py-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            normalizedStatus === "completed"
              ? "bg-green-50 text-green-600"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          {displayStatus}
        </span>
      </td>

      <td className="px-6 py-4 text-sm text-gray-400">{date}</td>
    </tr>
  );
};

export default Dashboard;
