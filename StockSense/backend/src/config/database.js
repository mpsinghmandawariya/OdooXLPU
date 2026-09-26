const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

// Configure SQLite for high concurrency & enterprise multi-user workloads
prisma.$queryRawUnsafe("PRAGMA journal_mode = WAL;").catch(() => {});
prisma.$queryRawUnsafe("PRAGMA busy_timeout = 5000;").catch(() => {});
prisma.$queryRawUnsafe("PRAGMA synchronous = NORMAL;").catch(() => {});

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = prisma;
