/*
  Warnings:

  - The values [PENDING,WAITING] on the enum `OperationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "MoveType" AS ENUM ('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT');

-- AlterEnum
BEGIN;
CREATE TYPE "OperationStatus_new" AS ENUM ('DRAFT', 'READY', 'COMPLETED', 'CANCELLED');
ALTER TABLE "inventory_operations" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "inventory_operations" ALTER COLUMN "status" TYPE "OperationStatus_new" USING ("status"::text::"OperationStatus_new");
ALTER TYPE "OperationStatus" RENAME TO "OperationStatus_old";
ALTER TYPE "OperationStatus_new" RENAME TO "OperationStatus";
DROP TYPE "OperationStatus_old";
ALTER TABLE "inventory_operations" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- DropForeignKey
ALTER TABLE "inventory_operations" DROP CONSTRAINT "inventory_operations_locationId_fkey";

-- AlterTable
ALTER TABLE "inventory_operations" ADD COLUMN     "contact" TEXT;

-- CreateTable
CREATE TABLE "stock_moves" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "moveType" "MoveType" NOT NULL,
    "sourceLocationId" TEXT,
    "destinationLocationId" TEXT,
    "operationId" TEXT,
    "operationType" "OperationType",
    "contact" TEXT,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_moves_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stock_moves_productId_idx" ON "stock_moves"("productId");

-- CreateIndex
CREATE INDEX "stock_moves_operationId_idx" ON "stock_moves"("operationId");

-- CreateIndex
CREATE INDEX "stock_moves_createdAt_idx" ON "stock_moves"("createdAt");

-- CreateIndex
CREATE INDEX "stock_moves_moveType_idx" ON "stock_moves"("moveType");

-- AddForeignKey
ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_sourceLocationId_fkey" FOREIGN KEY ("sourceLocationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_destinationLocationId_fkey" FOREIGN KEY ("destinationLocationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_operations" ADD CONSTRAINT "inventory_operations_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
