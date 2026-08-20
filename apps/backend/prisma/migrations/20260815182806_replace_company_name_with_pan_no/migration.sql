/*
  Warnings:

  - You are about to drop the column `companyName` on the `Supplier` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Supplier" DROP COLUMN "companyName",
ADD COLUMN     "panNo" TEXT;
