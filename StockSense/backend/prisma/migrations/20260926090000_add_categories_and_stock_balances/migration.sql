-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_balances" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_balances_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "products" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "products" ADD COLUMN "unitOfMeasure" TEXT;

-- Backfill existing data
INSERT INTO "categories" ("id", "name", "description", "isActive", "createdAt", "updatedAt")
SELECT '11111111-1111-4111-8111-111111111111', 'Uncategorized', 'Default category for existing products', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "categories" WHERE "name" = 'Uncategorized'
);

UPDATE "products"
SET "categoryId" = (SELECT "id" FROM "categories" WHERE "name" = 'Uncategorized')
WHERE "categoryId" IS NULL;

UPDATE "products"
SET "unitOfMeasure" = 'pcs'
WHERE "unitOfMeasure" IS NULL;

-- Enforce required fields
ALTER TABLE "products" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "products" ALTER COLUMN "unitOfMeasure" SET NOT NULL;

-- Indexes and constraints
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");
CREATE INDEX "categories_name_idx" ON "categories"("name");
CREATE INDEX "categories_isActive_idx" ON "categories"("isActive");
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");
CREATE INDEX "stock_balances_productId_idx" ON "stock_balances"("productId");
CREATE INDEX "stock_balances_locationId_idx" ON "stock_balances"("locationId");
CREATE UNIQUE INDEX "stock_balances_productId_locationId_key" ON "stock_balances"("productId", "locationId");

-- Foreign keys
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "stock_balances" ADD CONSTRAINT "stock_balances_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "stock_balances" ADD CONSTRAINT "stock_balances_locationId_fkey"
FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
