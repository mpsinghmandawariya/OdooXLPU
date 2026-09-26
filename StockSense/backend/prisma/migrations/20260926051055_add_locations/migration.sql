-- AlterTable
ALTER TABLE "inventory_operations" ADD COLUMN     "locationId" TEXT;

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "locations_warehouseId_idx" ON "locations"("warehouseId");

-- CreateIndex
CREATE INDEX "locations_name_idx" ON "locations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "locations_warehouseId_shortCode_key" ON "locations"("warehouseId", "shortCode");

-- CreateIndex
CREATE INDEX "inventory_operations_locationId_idx" ON "inventory_operations"("locationId");

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_operations" ADD CONSTRAINT "inventory_operations_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
