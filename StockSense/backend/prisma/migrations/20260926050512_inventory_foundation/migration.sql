-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF');

-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "OperationStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "loginId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'INVENTORY_MANAGER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_otps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_operations" (
    "id" TEXT NOT NULL,
    "operationType" "OperationType" NOT NULL,
    "status" "OperationStatus" NOT NULL DEFAULT 'PENDING',
    "referenceNo" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "scheduledDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "productId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_operations_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE INDEX "products_sku_idx" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");

-- CreateIndex
CREATE INDEX "warehouses_name_idx" ON "warehouses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_operations_referenceNo_key" ON "inventory_operations"("referenceNo");

-- CreateIndex
CREATE INDEX "inventory_operations_operationType_idx" ON "inventory_operations"("operationType");

-- CreateIndex
CREATE INDEX "inventory_operations_status_idx" ON "inventory_operations"("status");

-- CreateIndex
CREATE INDEX "inventory_operations_scheduledDate_idx" ON "inventory_operations"("scheduledDate");

-- CreateIndex
CREATE INDEX "inventory_operations_productId_idx" ON "inventory_operations"("productId");

-- CreateIndex
CREATE INDEX "inventory_operations_warehouseId_idx" ON "inventory_operations"("warehouseId");

-- CreateIndex
CREATE INDEX "inventory_operations_createdAt_idx" ON "inventory_operations"("createdAt");

-- AddForeignKey
ALTER TABLE "password_reset_otps" ADD CONSTRAINT "password_reset_otps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_operations" ADD CONSTRAINT "inventory_operations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_operations" ADD CONSTRAINT "inventory_operations_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_operations" ADD CONSTRAINT "inventory_operations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
