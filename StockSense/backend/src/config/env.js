try { require("dotenv").config(); } catch (_) {}

const env = {
  port: Number(process.env.PORT) || 5000,
  jwtSecret: process.env.JWT_SECRET || "stocksense-demo-jwt-secret-2026",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV || "development",
};

module.exports = env;
