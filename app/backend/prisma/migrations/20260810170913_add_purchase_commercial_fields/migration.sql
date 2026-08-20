/*
  Add purchase commercial fields and remove manufacturing date.
*/

-- Remove manufacturing date
ALTER TABLE "MedicineBatch"
DROP COLUMN "manufacturingDate";

-- Add the new fields with temporary defaults so existing
-- MedicineBatch rows can be migrated safely.
ALTER TABLE "MedicineBatch"
ADD COLUMN "bonus" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "discount" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN "mrp" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "pack" TEXT NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN "rate" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Existing batches don't have historical MRP/rate values.
-- Preserve their existing purchase price as the fallback.
UPDATE "MedicineBatch"
SET
  "rate" = "purchasePrice",
  "mrp" = "purchasePrice";

-- Remove temporary defaults.
-- New records must explicitly provide these values.
ALTER TABLE "MedicineBatch"
ALTER COLUMN "pack" DROP DEFAULT,
ALTER COLUMN "rate" DROP DEFAULT,
ALTER COLUMN "mrp" DROP DEFAULT;

-- Optional purchase-level unique number.
ALTER TABLE "Purchase"
ADD COLUMN "uniqueNumber" TEXT;
