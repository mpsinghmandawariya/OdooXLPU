require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminPassword) {
  throw new Error(
    "ADMIN_PASSWORD environment variable is required for seeding",
  );
}

async function main() {
  console.log("Seeding StockSense database...");

  const accessoriesCategory = await prisma.category.upsert({
    where: { name: "Accessories" },
    update: {},
    create: {
      name: "Accessories",
      description: "Computer accessories and peripherals",
    },
  });

  const monitorsCategory = await prisma.category.upsert({
    where: { name: "Monitors" },
    update: {},
    create: {
      name: "Monitors",
      description: "Displays and monitors",
    },
  });

  const mouse = await prisma.product.upsert({
    where: { sku: "SKU-MOUSE-001" },
    update: {
      categoryId: accessoriesCategory.id,
      unitOfMeasure: "pcs",
    },
    create: {
      sku: "SKU-MOUSE-001",
      name: "Wireless Mouse",
      description: "Wireless ergonomic mouse",
      categoryId: accessoriesCategory.id,
      unitOfMeasure: "pcs",
      unitPrice: 899,
    },
  });

  const keyboard = await prisma.product.upsert({
    where: { sku: "SKU-KEY-001" },
    update: {
      categoryId: accessoriesCategory.id,
      unitOfMeasure: "pcs",
    },
    create: {
      sku: "SKU-KEY-001",
      name: "Mechanical Keyboard",
      description: "Mechanical RGB keyboard",
      categoryId: accessoriesCategory.id,
      unitOfMeasure: "pcs",
      unitPrice: 2499,
    },
  });

  const monitor = await prisma.product.upsert({
    where: { sku: "SKU-MON-001" },
    update: {
      categoryId: monitorsCategory.id,
      unitOfMeasure: "pcs",
    },
    create: {
      sku: "SKU-MON-001",
      name: '27" Monitor',
      description: "27 inch Full HD monitor",
      categoryId: monitorsCategory.id,
      unitOfMeasure: "pcs",
      unitPrice: 15999,
    },
  });

  const mainWarehouse = await prisma.warehouse.upsert({
    where: { code: "WH-MAIN" },
    update: {},
    create: {
      code: "WH-MAIN",
      name: "Main Warehouse",
      location: "Vadodara",
    },
  });

  const secondaryWarehouse = await prisma.warehouse.upsert({
    where: { code: "WH-SEC" },
    update: {},
    create: {
      code: "WH-SEC",
      name: "Secondary Warehouse",
      location: "Ahmedabad",
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { loginId: "admin001" },
    update: {
      email: "admin@stocksense.local",
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
    },
    create: {
      loginId: "admin001",
      email: "admin@stocksense.local",
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
    },
  });

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  await prisma.inventoryOperation.createMany({
    skipDuplicates: true,
    data: [
      {
        referenceNumber: "GRN-0001",
        type: "RECEIPT",
        status: "READY",
        quantity: 25,
        scheduledDate: tomorrow,
        productId: mouse.id,
        warehouseId: mainWarehouse.id,
        createdById: adminUser.id,
      },
      {
        referenceNumber: "GRN-0002",
        type: "RECEIPT",
        status: "READY",
        quantity: 40,
        scheduledDate: yesterday,
        productId: keyboard.id,
        warehouseId: mainWarehouse.id,
        createdById: adminUser.id,
      },
      {
        referenceNumber: "GRN-0003",
        type: "RECEIPT",
        status: "COMPLETED",
        quantity: 30,
        scheduledDate: yesterday,
        completedAt: yesterday,
        productId: monitor.id,
        warehouseId: mainWarehouse.id,
        createdById: adminUser.id,
      },
      {
        referenceNumber: "DEL-0001",
        type: "DELIVERY",
        status: "READY",
        quantity: 12,
        scheduledDate: tomorrow,
        productId: keyboard.id,
        warehouseId: mainWarehouse.id,
        createdById: adminUser.id,
      },
      {
        referenceNumber: "DEL-0002",
        type: "DELIVERY",
        status: "READY",
        quantity: 8,
        scheduledDate: yesterday,
        productId: mouse.id,
        warehouseId: secondaryWarehouse.id,
        createdById: adminUser.id,
      },
      {
        referenceNumber: "DEL-0003",
        type: "DELIVERY",
        status: "COMPLETED",
        quantity: 15,
        scheduledDate: yesterday,
        completedAt: yesterday,
        productId: monitor.id,
        warehouseId: mainWarehouse.id,
        createdById: adminUser.id,
      },
      {
        referenceNumber: "TRF-0001",
        type: "TRANSFER",
        status: "COMPLETED",
        quantity: 18,
        completedAt: yesterday,
        productId: mouse.id,
        warehouseId: secondaryWarehouse.id,
        createdById: adminUser.id,
      },
      {
        referenceNumber: "ADJ-0001",
        type: "ADJUSTMENT",
        status: "COMPLETED",
        quantity: 5,
        completedAt: yesterday,
        productId: keyboard.id,
        warehouseId: mainWarehouse.id,
        createdById: adminUser.id,
      },
    ],
  });

  console.log("✓ StockSense database seeded successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
