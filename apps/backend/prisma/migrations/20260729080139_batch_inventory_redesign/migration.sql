/*
  Warnings:

  - You are about to drop the column `medicineId` on the `InventoryTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `batchNo` on the `Medicine` table. All the data in the column will be lost.
  - You are about to drop the column `expiryDate` on the `Medicine` table. All the data in the column will be lost.
  - You are about to drop the column `purchasePrice` on the `Medicine` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Medicine` table. All the data in the column will be lost.
  - You are about to drop the column `medicineId` on the `PurchaseItem` table. All the data in the column will be lost.
  - You are about to drop the column `medicineId` on the `SaleItem` table. All the data in the column will be lost.
  - Added the required column `batchId` to the `InventoryTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `batchId` to the `PurchaseItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `batchId` to the `SaleItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "InventoryTransaction" DROP CONSTRAINT "InventoryTransaction_medicineId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseItem" DROP CONSTRAINT "PurchaseItem_medicineId_fkey";

-- DropForeignKey
ALTER TABLE "SaleItem" DROP CONSTRAINT "SaleItem_medicineId_fkey";

-- DropIndex
DROP INDEX "InventoryTransaction_medicineId_idx";

-- DropIndex
DROP INDEX "Medicine_batchNo_key";

-- AlterTable
ALTER TABLE "InventoryTransaction" DROP COLUMN "medicineId",
ADD COLUMN     "batchId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Medicine" DROP COLUMN "batchNo",
DROP COLUMN "expiryDate",
DROP COLUMN "purchasePrice",
DROP COLUMN "stock";

-- AlterTable
ALTER TABLE "PurchaseItem" DROP COLUMN "medicineId",
ADD COLUMN     "batchId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SaleItem" DROP COLUMN "medicineId",
ADD COLUMN     "batchId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "MedicineBatch" (
    "id" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "supplierId" TEXT,
    "purchaseId" TEXT,
    "batchNo" TEXT NOT NULL,
    "manufacturingDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "purchasePrice" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "rackLocation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicineBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MedicineBatch_batchNo_key" ON "MedicineBatch"("batchNo");

-- CreateIndex
CREATE INDEX "MedicineBatch_medicineId_idx" ON "MedicineBatch"("medicineId");

-- CreateIndex
CREATE INDEX "MedicineBatch_expiryDate_idx" ON "MedicineBatch"("expiryDate");

-- CreateIndex
CREATE INDEX "MedicineBatch_stock_idx" ON "MedicineBatch"("stock");

-- CreateIndex
CREATE INDEX "InventoryTransaction_batchId_idx" ON "InventoryTransaction"("batchId");

-- CreateIndex
CREATE INDEX "Medicine_name_idx" ON "Medicine"("name");

-- AddForeignKey
ALTER TABLE "MedicineBatch" ADD CONSTRAINT "MedicineBatch_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicineBatch" ADD CONSTRAINT "MedicineBatch_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicineBatch" ADD CONSTRAINT "MedicineBatch_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "MedicineBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "MedicineBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "MedicineBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
