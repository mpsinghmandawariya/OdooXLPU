const assert = require("node:assert/strict");

process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://user:pass@localhost:5432/stocksense";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-1234567890";

const env = require("../src/config/env");

assert.notStrictEqual(env.jwtSecret, "stocksense-dev-secret");
assert.notStrictEqual(env.jwtSecret, "your-secret-key");
assert.ok(
  env.jwtSecret.length > 20,
  "JWT secret should not use an insecure default",
);

console.log("security checks passed");
