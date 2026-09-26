try { require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") }); } catch (_) {}

const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Safe default — judge can log in immediately without any setup
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@StockSense2026";

async function main() {
  console.log("🌱 Seeding StockSense database...");

  // ── Categories ────────────────────────────────────────────────────────────
  const electronics = await prisma.category.upsert({
    where: { name: "Electronics" },
    update: {},
    create: { name: "Electronics", description: "Electronic components and devices" },
  });

  const furniture = await prisma.category.upsert({
    where: { name: "Furniture" },
    update: {},
    create: { name: "Furniture", description: "Office and warehouse furniture" },
  });

  const stationery = await prisma.category.upsert({
    where: { name: "Stationery" },
    update: {},
    create: { name: "Stationery", description: "Office stationery and supplies" },
  });

  // ── Products ──────────────────────────────────────────────────────────────
  const mouse = await prisma.product.upsert({
    where: { sku: "SKU-MOUSE-001" },
    update: {},
    create: { sku: "SKU-MOUSE-001", name: "Wireless Mouse", categoryId: electronics.id, unitOfMeasure: "pcs", unitPrice: 899 },
  });

  const keyboard = await prisma.product.upsert({
    where: { sku: "SKU-KEY-001" },
    update: {},
    create: { sku: "SKU-KEY-001", name: "Mechanical Keyboard", categoryId: electronics.id, unitOfMeasure: "pcs", unitPrice: 2499 },
  });

  const monitor = await prisma.product.upsert({
    where: { sku: "SKU-MON-001" },
    update: {},
    create: { sku: "SKU-MON-001", name: "27\" Monitor", categoryId: electronics.id, unitOfMeasure: "pcs", unitPrice: 15999 },
  });

  const desk = await prisma.product.upsert({
    where: { sku: "SKU-DESK-001" },
    update: {},
    create: { sku: "SKU-DESK-001", name: "Office Desk", categoryId: furniture.id, unitOfMeasure: "pcs", unitPrice: 8500 },
  });

  const chair = await prisma.product.upsert({
    where: { sku: "SKU-CHAIR-001" },
    update: {},
    create: { sku: "SKU-CHAIR-001", name: "Ergonomic Chair", categoryId: furniture.id, unitOfMeasure: "pcs", unitPrice: 12000 },
  });

  const notebook = await prisma.product.upsert({
    where: { sku: "SKU-NB-001" },
    update: {},
    create: { sku: "SKU-NB-001", name: "A4 Notebook", categoryId: stationery.id, unitOfMeasure: "pcs", unitPrice: 120 },
  });

  // ── Warehouses ────────────────────────────────────────────────────────────
  const mainWH = await prisma.warehouse.upsert({
    where: { code: "WH-MAIN" },
    update: {},
    create: { code: "WH-MAIN", name: "Main Warehouse", location: "Vadodara, Gujarat" },
  });

  const secWH = await prisma.warehouse.upsert({
    where: { code: "WH-SEC" },
    update: {},
    create: { code: "WH-SEC", name: "Secondary Warehouse", location: "Ahmedabad, Gujarat" },
  });

  // ── Locations ─────────────────────────────────────────────────────────────
  const mainStock = await prisma.location.upsert({
    where: { warehouseId_shortCode: { warehouseId: mainWH.id, shortCode: "STOCK" } },
    update: {},
    create: { name: "Stock", shortCode: "STOCK", warehouseId: mainWH.id },
  });

  const rackA = await prisma.location.upsert({
    where: { warehouseId_shortCode: { warehouseId: mainWH.id, shortCode: "RACK-A" } },
    update: {},
    create: { name: "Rack A", shortCode: "RACK-A", warehouseId: mainWH.id },
  });

  const rackB = await prisma.location.upsert({
    where: { warehouseId_shortCode: { warehouseId: mainWH.id, shortCode: "RACK-B" } },
    update: {},
    create: { name: "Rack B", shortCode: "RACK-B", warehouseId: mainWH.id },
  });

  const secStock = await prisma.location.upsert({
    where: { warehouseId_shortCode: { warehouseId: secWH.id, shortCode: "STOCK" } },
    update: {},
    create: { name: "Stock", shortCode: "STOCK", warehouseId: secWH.id },
  });

  // ── Admin user ────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { loginId: "admin001" },
    update: { passwordHash, role: "ADMIN" },
    create: { loginId: "admin001", email: "admin@stocksense.local", passwordHash, role: "ADMIN" },
  });

  // ── Stock balances (pre-loaded inventory) ─────────────────────────────────
  const balances = [
    { productId: mouse.id,    locationId: mainStock.id, quantity: 150, reservedQuantity: 20 },
    { productId: keyboard.id, locationId: mainStock.id, quantity: 80,  reservedQuantity: 10 },
    { productId: monitor.id,  locationId: rackA.id,     quantity: 45,  reservedQuantity: 5  },
    { productId: desk.id,     locationId: rackB.id,     quantity: 30,  reservedQuantity: 0  },
    { productId: chair.id,    locationId: rackB.id,     quantity: 25,  reservedQuantity: 3  },
    { productId: notebook.id, locationId: mainStock.id, quantity: 500, reservedQuantity: 0  },
    { productId: mouse.id,    locationId: secStock.id,  quantity: 60,  reservedQuantity: 0  },
    { productId: keyboard.id, locationId: secStock.id,  quantity: 40,  reservedQuantity: 0  },
  ];

  for (const b of balances) {
    await prisma.stockBalance.upsert({
      where: { productId_locationId: { productId: b.productId, locationId: b.locationId } },
      update: { quantity: b.quantity, reservedQuantity: b.reservedQuantity },
      create: { productId: b.productId, locationId: b.locationId, quantity: b.quantity, reservedQuantity: b.reservedQuantity },
    });
  }

  // ── Sample operations ─────────────────────────────────────────────────────
  const now = new Date();
  const yesterday = new Date(now - 86400000);
  const tomorrow = new Date(now.getTime() + 86400000);

  const ops = [
    { referenceNumber: "WH/IN/0001", type: "RECEIPT",  status: "DRAFT",     quantity: 25, productId: mouse.id,    warehouseId: mainWH.id, locationId: mainStock.id, contact: "ABC Suppliers",   scheduledDate: tomorrow  },
    { referenceNumber: "WH/IN/0002", type: "RECEIPT",  status: "DRAFT",     quantity: 40, productId: keyboard.id, warehouseId: mainWH.id, locationId: mainStock.id, contact: "Metro Electronics", scheduledDate: tomorrow },
    { referenceNumber: "WH/IN/0003", type: "RECEIPT",  status: "COMPLETED", quantity: 30, productId: monitor.id,  warehouseId: mainWH.id, locationId: rackA.id,     contact: "Global Traders",  scheduledDate: yesterday, completedAt: yesterday },
    { referenceNumber: "WH/OUT/0001", type: "DELIVERY", status: "DRAFT",    quantity: 12, productId: keyboard.id, warehouseId: mainWH.id, locationId: mainStock.id, contact: "Raj Enterprises",  scheduledDate: tomorrow  },
    { referenceNumber: "WH/OUT/0002", type: "DELIVERY", status: "DRAFT",    quantity: 8,  productId: mouse.id,    warehouseId: secWH.id,  locationId: secStock.id,  contact: "Patel & Co",       scheduledDate: yesterday },
    { referenceNumber: "WH/OUT/0003", type: "DELIVERY", status: "COMPLETED", quantity: 15, productId: monitor.id, warehouseId: mainWH.id, locationId: rackA.id,     contact: "City Computers",   scheduledDate: yesterday, completedAt: yesterday },
  ];

  for (const op of ops) {
    await prisma.inventoryOperation.upsert({
      where: { referenceNumber: op.referenceNumber },
      update: {},
      create: { ...op, createdById: admin.id },
    });
  }

  // ── Sample stock moves (move history) ─────────────────────────────────────
  const moves = [
    { reference: "WH/IN/0003",  productId: monitor.id,  quantity: 30, moveType: "IN",  destinationLocationId: rackA.id,     contact: "Global Traders",  createdById: admin.id },
    { reference: "WH/OUT/0003", productId: monitor.id,  quantity: 15, moveType: "OUT", sourceLocationId: rackA.id,          contact: "City Computers",  createdById: admin.id },
    { reference: "WH/IN/INIT",  productId: mouse.id,    quantity: 150, moveType: "IN", destinationLocationId: mainStock.id, contact: "Opening Stock",   createdById: admin.id },
    { reference: "WH/IN/INIT",  productId: keyboard.id, quantity: 80,  moveType: "IN", destinationLocationId: mainStock.id, contact: "Opening Stock",   createdById: admin.id },
  ];

  for (const m of moves) {
    const exists = await prisma.stockMove.findFirst({ where: { reference: m.reference, productId: m.productId } });
    if (!exists) await prisma.stockMove.create({ data: m });
  }

  console.log("✅ Database seeded successfully!");
  console.log("─────────────────────────────────────");
  console.log("  Login ID : admin001");
  console.log("  Password : " + ADMIN_PASSWORD);
  console.log("  URL      : http://localhost:5173");
  console.log("─────────────────────────────────────");
}

main()
  .catch((e) => { console.error("Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
