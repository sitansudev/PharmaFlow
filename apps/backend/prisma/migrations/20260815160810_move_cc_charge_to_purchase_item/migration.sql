/*
  Warnings:

  - You are about to drop the column `ccCharge` on the `Purchase` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "ccCharge";

-- AlterTable
ALTER TABLE "PurchaseItem" ADD COLUMN     "ccCharge" DECIMAL(10,2) NOT NULL DEFAULT 0;
