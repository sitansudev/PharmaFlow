/*
  Warnings:

  - You are about to drop the column `batchNo` on the `Medicine` table. All the data in the column will be lost.
  - You are about to drop the column `expiryDate` on the `Medicine` table. All the data in the column will be lost.
  - You are about to drop the column `purchasePrice` on the `Medicine` table. All the data in the column will be lost.
  - You are about to drop the column `supplierId` on the `Medicine` table. All the data in the column will be lost.
  - You are about to drop the column `medicineId` on the `PurchaseItem` table. All the data in the column will be lost.
  - You are about to drop the column `medicineId` on the `SaleItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[barcode]` on the table `Medicine` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `batchId` to the `PurchaseItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `batchNo` to the `PurchaseItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiryDate` to the `PurchaseItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `batchId` to the `SaleItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Medicine" DROP CONSTRAINT "Medicine_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseItem" DROP CONSTRAINT "PurchaseItem_medicineId_fkey";

-- DropForeignKey
ALTER TABLE "SaleItem" DROP CONSTRAINT "SaleItem_medicineId_fkey";

-- DropIndex
DROP INDEX "Medicine_batchNo_key";

-- AlterTable
ALTER TABLE "InventoryTransaction" ADD COLUMN     "batchId" TEXT;

-- AlterTable
ALTER TABLE "Medicine" DROP COLUMN "batchNo",
DROP COLUMN "expiryDate",
DROP COLUMN "purchasePrice",
DROP COLUMN "supplierId",
ADD COLUMN     "barcode" TEXT;

-- AlterTable
ALTER TABLE "PurchaseItem" DROP COLUMN "medicineId",
ADD COLUMN     "batchId" TEXT NOT NULL,
ADD COLUMN     "batchNo" TEXT NOT NULL,
ADD COLUMN     "expiryDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "manufacturingDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SaleItem" DROP COLUMN "medicineId",
ADD COLUMN     "batchId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "MedicineBatch" (
    "id" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "batchNo" TEXT NOT NULL,
    "manufacturingDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "purchasePrice" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "rackLocation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "supplierId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "receivedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicineBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MedicineBatch_expiryDate_idx" ON "MedicineBatch"("expiryDate");

-- CreateIndex
CREATE INDEX "MedicineBatch_medicineId_expiryDate_idx" ON "MedicineBatch"("medicineId", "expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "MedicineBatch_medicineId_batchNo_key" ON "MedicineBatch"("medicineId", "batchNo");

-- CreateIndex
CREATE INDEX "InventoryTransaction_batchId_idx" ON "InventoryTransaction"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "Medicine_barcode_key" ON "Medicine"("barcode");

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "MedicineBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "MedicineBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "MedicineBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicineBatch" ADD CONSTRAINT "MedicineBatch_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicineBatch" ADD CONSTRAINT "MedicineBatch_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
