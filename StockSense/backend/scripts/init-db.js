#!/usr/bin/env node
/**
 * StockSense DB initializer — runs before the server starts.
 * 1. prisma migrate deploy  (creates/updates the SQLite DB)
 * 2. node prisma/seed.js    (idempotent seed)
 */

const { execSync } = require("child_process");
const path = require("path");

const root = path.resolve(__dirname, "..");

function run(cmd) {
  execSync(cmd, { cwd: root, stdio: "inherit" });
}

try {
  console.log("⚙️  Initializing StockSense database...");
  run("npx prisma migrate deploy");
  run("node prisma/seed.js");
  console.log("✅ Database ready.\n");
} catch (err) {
  console.error("\n❌ StockSense startup failed.\n");
  console.error("Reason:", err.message || err);
  console.error("\nHow to fix:");
  console.error("  1. Make sure you ran: npm install");
  console.error("  2. Check that backend/prisma/schema.prisma exists");
  console.error("  3. Delete backend/prisma/stocksense.db and retry\n");
  process.exit(1);
}
