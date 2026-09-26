-- CreateTable
CREATE TABLE "reordering_rules" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "warehouseId" TEXT,
    "locationId" TEXT,
    "minimumQuantity" DECIMAL(18,3) NOT NULL,
    "maximumQuantity" DECIMAL(18,3) NOT NULL,
    "reorderQuantity" DECIMAL(18,3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reordering_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reordering_rules_productId_idx" ON "reordering_rules"("productId");

-- CreateIndex
CREATE INDEX "reordering_rules_warehouseId_idx" ON "reordering_rules"("warehouseId");

-- CreateIndex
CREATE INDEX "reordering_rules_locationId_idx" ON "reordering_rules"("locationId");

-- CreateIndex
CREATE INDEX "reordering_rules_isActive_idx" ON "reordering_rules"("isActive");

-- AddForeignKey
ALTER TABLE "reordering_rules" ADD CONSTRAINT "reordering_rules_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reordering_rules" ADD CONSTRAINT "reordering_rules_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reordering_rules" ADD CONSTRAINT "reordering_rules_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
