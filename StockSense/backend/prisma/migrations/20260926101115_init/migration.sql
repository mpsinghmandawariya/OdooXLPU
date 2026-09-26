-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loginId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'INVENTORY_MANAGER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "password_reset_otps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "password_reset_otps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "unitOfMeasure" TEXT NOT NULL,
    "unitPrice" REAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "locations_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stock_balances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "quantity" REAL NOT NULL DEFAULT 0,
    "reservedQuantity" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "stock_balances_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "stock_balances_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stock_moves" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "moveType" TEXT NOT NULL,
    "sourceLocationId" TEXT,
    "destinationLocationId" TEXT,
    "operationId" TEXT,
    "operationType" TEXT,
    "contact" TEXT,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stock_moves_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "stock_moves_sourceLocationId_fkey" FOREIGN KEY ("sourceLocationId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "stock_moves_destinationLocationId_fkey" FOREIGN KEY ("destinationLocationId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "stock_moves_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inventory_operations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "referenceNumber" TEXT NOT NULL,
    "contact" TEXT,
    "productId" TEXT NOT NULL,
    "warehouseId" TEXT,
    "locationId" TEXT,
    "sourceLocationId" TEXT,
    "destinationLocationId" TEXT,
    "quantity" REAL NOT NULL,
    "unitCost" REAL,
    "scheduledDate" DATETIME,
    "completedAt" DATETIME,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "inventory_operations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "inventory_operations_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "inventory_operations_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "inventory_operations_sourceLocationId_fkey" FOREIGN KEY ("sourceLocationId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "inventory_operations_destinationLocationId_fkey" FOREIGN KEY ("destinationLocationId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "inventory_operations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reordering_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "warehouseId" TEXT,
    "locationId" TEXT,
    "minimumQuantity" REAL NOT NULL,
    "maximumQuantity" REAL NOT NULL,
    "reorderQuantity" REAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reordering_rules_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reordering_rules_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "reordering_rules_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_loginId_key" ON "users"("loginId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_loginId_idx" ON "users"("loginId");

-- CreateIndex
CREATE INDEX "password_reset_otps_userId_idx" ON "password_reset_otps"("userId");

-- CreateIndex
CREATE INDEX "password_reset_otps_expiresAt_idx" ON "password_reset_otps"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE INDEX "categories_name_idx" ON "categories"("name");

-- CreateIndex
CREATE INDEX "categories_isActive_idx" ON "categories"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE INDEX "products_sku_idx" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- CreateIndex
CREATE INDEX "products_isActive_idx" ON "products"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");

-- CreateIndex
CREATE INDEX "warehouses_name_idx" ON "warehouses"("name");

-- CreateIndex
CREATE INDEX "locations_warehouseId_idx" ON "locations"("warehouseId");

-- CreateIndex
CREATE INDEX "locations_name_idx" ON "locations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "locations_warehouseId_shortCode_key" ON "locations"("warehouseId", "shortCode");

-- CreateIndex
CREATE INDEX "stock_balances_productId_idx" ON "stock_balances"("productId");

-- CreateIndex
CREATE INDEX "stock_balances_locationId_idx" ON "stock_balances"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "stock_balances_productId_locationId_key" ON "stock_balances"("productId", "locationId");

-- CreateIndex
CREATE INDEX "stock_moves_productId_idx" ON "stock_moves"("productId");

-- CreateIndex
CREATE INDEX "stock_moves_operationId_idx" ON "stock_moves"("operationId");

-- CreateIndex
CREATE INDEX "stock_moves_createdAt_idx" ON "stock_moves"("createdAt");

-- CreateIndex
CREATE INDEX "stock_moves_moveType_idx" ON "stock_moves"("moveType");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_operations_referenceNumber_key" ON "inventory_operations"("referenceNumber");

-- CreateIndex
CREATE INDEX "inventory_operations_type_idx" ON "inventory_operations"("type");

-- CreateIndex
CREATE INDEX "inventory_operations_status_idx" ON "inventory_operations"("status");

-- CreateIndex
CREATE INDEX "inventory_operations_productId_idx" ON "inventory_operations"("productId");

-- CreateIndex
CREATE INDEX "inventory_operations_createdAt_idx" ON "inventory_operations"("createdAt");

-- CreateIndex
CREATE INDEX "inventory_operations_scheduledDate_idx" ON "inventory_operations"("scheduledDate");

-- CreateIndex
CREATE INDEX "inventory_operations_warehouseId_idx" ON "inventory_operations"("warehouseId");

-- CreateIndex
CREATE INDEX "inventory_operations_locationId_idx" ON "inventory_operations"("locationId");

-- CreateIndex
CREATE INDEX "reordering_rules_productId_idx" ON "reordering_rules"("productId");

-- CreateIndex
CREATE INDEX "reordering_rules_warehouseId_idx" ON "reordering_rules"("warehouseId");

-- CreateIndex
CREATE INDEX "reordering_rules_locationId_idx" ON "reordering_rules"("locationId");

-- CreateIndex
CREATE INDEX "reordering_rules_isActive_idx" ON "reordering_rules"("isActive");
