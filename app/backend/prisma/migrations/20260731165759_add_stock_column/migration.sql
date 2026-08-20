/*
  Warnings:

  - You are about to drop the column `batchId` on the `InventoryTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `batchId` on the `PurchaseItem` table. All the data in the column will be lost.
  - You are about to drop the column `batchId` on the `SaleItem` table. All the data in the column will be lost.
  - You are about to drop the `MedicineBatch` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[batchNo]` on the table `Medicine` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `medicineId` to the `InventoryTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `batchNo` to the `Medicine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiryDate` to the `Medicine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchasePrice` to the `Medicine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medicineId` to the `PurchaseItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medicineId` to the `SaleItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "InventoryTransaction" DROP CONSTRAINT "InventoryTransaction_batchId_fkey";

-- DropForeignKey
ALTER TABLE "MedicineBatch" DROP CONSTRAINT "MedicineBatch_medicineId_fkey";

-- DropForeignKey
ALTER TABLE "MedicineBatch" DROP CONSTRAINT "MedicineBatch_purchaseId_fkey";

-- DropForeignKey
ALTER TABLE "MedicineBatch" DROP CONSTRAINT "MedicineBatch_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseItem" DROP CONSTRAINT "PurchaseItem_batchId_fkey";

-- DropForeignKey
ALTER TABLE "SaleItem" DROP CONSTRAINT "SaleItem_batchId_fkey";

-- DropIndex
DROP INDEX "InventoryTransaction_batchId_idx";

-- DropIndex
DROP INDEX "Medicine_name_idx";

-- AlterTable
ALTER TABLE "InventoryTransaction" DROP COLUMN "batchId",
ADD COLUMN     "medicineId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Medicine" ADD COLUMN     "batchNo" TEXT NOT NULL,
ADD COLUMN     "expiryDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "purchasePrice" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PurchaseItem" DROP COLUMN "batchId",
ADD COLUMN     "medicineId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SaleItem" DROP COLUMN "batchId",
ADD COLUMN     "medicineId" TEXT NOT NULL;

-- DropTable
DROP TABLE "MedicineBatch";

-- CreateIndex
CREATE INDEX "InventoryTransaction_medicineId_idx" ON "InventoryTransaction"("medicineId");

-- CreateIndex
CREATE UNIQUE INDEX "Medicine_batchNo_key" ON "Medicine"("batchNo");

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
