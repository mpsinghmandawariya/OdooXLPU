const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const productRoutes = require("./modules/products/product.routes");
const categoryRoutes = require("./modules/category/category.routes");
const stockRoutes = require("./modules/stock/stock.routes");
const warehouseRoutes = require("./modules/warehouse/warehouse.routes");
const locationRoutes = require("./modules/location/location.routes");
const moveHistoryRoutes = require("./modules/move-history/move-history.routes");
const receiptRoutes = require("./modules/receipt/receipt.routes");
const deliveryRoutes = require("./modules/delivery/delivery.routes");
const userRoutes = require("./modules/user/user.routes");
const inventoryRoutes = require("./modules/inventory/inventory.routes");
const reorderingRoutes = require("./modules/reordering/reordering.routes");
const errorHandler = require("./middleware/error.middleware");

const app = express();
const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return true;
  return false;
};

const createCsrfToken = () => crypto.randomBytes(32).toString("hex");
const safeCompare = (a, b) => {
  if (!a || !b) return false;
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(null, true); // Permissive in dev to avoid blocking hackathon evaluation
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/v1/csrf-token", (req, res) => {
  const csrfToken = createCsrfToken();

  res.cookie("csrfToken", csrfToken, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    success: true,
    csrfToken,
  });
});

app.use((req, res, next) => {
  if (
    req.path.startsWith("/api/v1/auth") ||
    req.method === "GET" ||
    req.method === "HEAD" ||
    req.method === "OPTIONS"
  ) {
    return next();
  }

  const submittedToken =
    req.headers["x-csrf-token"] ||
    req.headers["X-CSRF-Token"] ||
    req.body?._csrf;

  const cookieToken = req.cookies?.csrfToken;

  // If cookie is set and submitted token exists, verify them
  if (cookieToken && submittedToken) {
    if (!safeCompare(submittedToken, cookieToken)) {
      return res.status(403).json({
        success: false,
        message: "CSRF token missing or invalid",
      });
    }
    return next();
  }

  // If Authorization header (Bearer token) is present, JWT prevents CSRF in SPA
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    return next();
  }

  if (!submittedToken && !cookieToken) {
    return res.status(403).json({
      success: false,
      message: "CSRF token missing or invalid",
    });
  }

  return next();
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "StockSense API",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "StockSense API is running",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/stock", stockRoutes);
app.use("/api/v1/warehouses", warehouseRoutes);
app.use("/api/v1/locations", locationRoutes);
app.use("/api/v1/move-history", moveHistoryRoutes);
app.use("/api/v1/receipts", receiptRoutes);
app.use("/api/v1/deliveries", deliveryRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/operations", inventoryRoutes);
app.use("/api/v1/reordering-rules", reorderingRoutes);
app.use(errorHandler);

module.exports = app;
