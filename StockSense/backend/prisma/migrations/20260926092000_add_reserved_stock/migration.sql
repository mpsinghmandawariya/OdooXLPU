-- AlterTable
ALTER TABLE "stock_balances"
ADD COLUMN "reservedQuantity" DECIMAL(14,3) NOT NULL DEFAULT 0;

-- Backfill existing rows
UPDATE "stock_balances"
SET "reservedQuantity" = 0
WHERE "reservedQuantity" IS NULL;
