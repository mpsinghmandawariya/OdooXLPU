-- Safe migration from the legacy inventory-operation schema to the current operation ledger
-- This database is empty in local development, so we can upgrade without data loss.

ALTER TABLE "inventory_operations"
  RENAME COLUMN "operationType" TO "type";

ALTER TABLE "inventory_operations"
  RENAME COLUMN "referenceNo" TO "referenceNumber";

ALTER TABLE "inventory_operations"
  ADD COLUMN IF NOT EXISTS "destinationLocationId" TEXT,
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "sourceLocationId" TEXT,
  ADD COLUMN IF NOT EXISTS "unitCost" DECIMAL(12,2);

ALTER TABLE "inventory_operations"
  ALTER COLUMN "quantity" TYPE DECIMAL(14,3) USING "quantity"::DECIMAL(14,3),
  ALTER COLUMN "status" SET DEFAULT 'DRAFT',
  ALTER COLUMN "warehouseId" DROP NOT NULL,
  ALTER COLUMN "createdById" SET NOT NULL;

-- Update enum to the final type set used by the application.
CREATE TYPE "OperationType_new" AS ENUM ('RECEIPT', 'DELIVERY', 'TRANSFER', 'INTERNAL_TRANSFER', 'ADJUSTMENT');

ALTER TABLE "inventory_operations"
  ALTER COLUMN "type" TYPE "OperationType_new"
  USING (
    CASE
      WHEN "type"::text = 'RECEIPT' THEN 'RECEIPT'::"OperationType_new"
      WHEN "type"::text = 'DELIVERY' THEN 'DELIVERY'::"OperationType_new"
      WHEN "type"::text = 'TRANSFER' THEN 'TRANSFER'::"OperationType_new"
      WHEN "type"::text = 'ADJUSTMENT' THEN 'ADJUSTMENT'::"OperationType_new"
      ELSE NULL
    END
  );

ALTER TYPE "OperationType" RENAME TO "OperationType_old";
ALTER TYPE "OperationType_new" RENAME TO "OperationType";
DROP TYPE IF EXISTS "public"."OperationType_old";

DROP INDEX IF EXISTS "inventory_operations_operationType_idx";
DROP INDEX IF EXISTS "inventory_operations_referenceNo_key";

CREATE UNIQUE INDEX IF NOT EXISTS "inventory_operations_referenceNumber_key"
  ON "inventory_operations"("referenceNumber");

CREATE INDEX IF NOT EXISTS "inventory_operations_type_idx"
  ON "inventory_operations"("type");

ALTER TABLE "inventory_operations"
  ADD CONSTRAINT "inventory_operations_sourceLocationId_fkey"
  FOREIGN KEY ("sourceLocationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "inventory_operations"
  ADD CONSTRAINT "inventory_operations_destinationLocationId_fkey"
  FOREIGN KEY ("destinationLocationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "inventory_operations"
  DROP CONSTRAINT IF EXISTS "inventory_operations_createdById_fkey";

ALTER TABLE "inventory_operations"
  ADD CONSTRAINT "inventory_operations_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
