const dotenv = require("dotenv");

dotenv.config();

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const env = {
  port: Number(process.env.PORT) || 5000,
  jwtSecret: process.env.JWT_SECRET || "stocksense-local-development-secret",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};

module.exports = env;
