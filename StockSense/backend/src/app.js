const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const env = require("./config/env");
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
const errorHandler = require("./middleware/error.middleware");

const app = express();
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];

const createCsrfToken = () => crypto.randomBytes(32).toString("hex");
const safeCompare = (a, b) => {
  const left = Buffer.from(a || "");
  const right = Buffer.from(b || "");
  const maxLength = Math.max(left.length, right.length);

  const paddedLeft = Buffer.alloc(maxLength, 0);
  const paddedRight = Buffer.alloc(maxLength, 0);

  left.copy(paddedLeft);
  right.copy(paddedRight);

  return crypto.timingSafeEqual(paddedLeft, paddedRight);
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
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
    httpOnly: true,
    sameSite: "lax",
    secure: false,
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

  if (!submittedToken || !req.cookies?.csrfToken) {
    return res.status(403).json({
      success: false,
      message: "CSRF token missing or invalid",
    });
  }

  if (!safeCompare(submittedToken, req.cookies.csrfToken)) {
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
app.use(errorHandler);

module.exports = app;
