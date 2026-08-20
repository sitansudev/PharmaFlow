/*
  Warnings:

  - You are about to drop the column `brand` on the `Medicine` table. All the data in the column will be lost.
  - Added the required column `supplierId` to the `Medicine` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Medicine" DROP COLUMN "brand",
ADD COLUMN     "supplierId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Medicine" ADD CONSTRAINT "Medicine_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
