/*
  Warnings:

  - You are about to drop the column `batchNo` on the `PurchaseItem` table. All the data in the column will be lost.
  - You are about to drop the column `expiryDate` on the `PurchaseItem` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturingDate` on the `PurchaseItem` table. All the data in the column will be lost.
  - Added the required column `paidAmount` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `costPrice` to the `SaleItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'UPI', 'CARD', 'CREDIT', 'MIXED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'PARTIAL', 'PENDING');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "loyaltyPoints" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Medicine" ADD COLUMN     "latestBatchNo" TEXT,
ADD COLUMN     "latestExpiryDate" TIMESTAMP(3),
ADD COLUMN     "latestPurchasePrice" DECIMAL(10,2),
ADD COLUMN     "latestSupplierId" TEXT;

-- AlterTable
ALTER TABLE "MedicineBatch" ADD COLUMN     "purchaseId" TEXT,
ADD COLUMN     "remainingQuantity" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PurchaseItem" DROP COLUMN "batchNo",
DROP COLUMN "expiryDate",
DROP COLUMN "manufacturingDate";

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "balanceAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "paidAmount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PAID',
ADD COLUMN     "tax" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SaleItem" ADD COLUMN     "costPrice" DECIMAL(10,2) NOT NULL;

-- CreateIndex
CREATE INDEX "MedicineBatch_medicineId_remainingQuantity_idx" ON "MedicineBatch"("medicineId", "remainingQuantity");

-- AddForeignKey
ALTER TABLE "MedicineBatch" ADD CONSTRAINT "MedicineBatch_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
