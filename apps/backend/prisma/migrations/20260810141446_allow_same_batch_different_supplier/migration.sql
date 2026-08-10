/*
  Warnings:

  - A unique constraint covering the columns `[medicineId,batchNo,supplierId]` on the table `MedicineBatch` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "MedicineBatch_medicineId_batchNo_key";

-- CreateIndex
CREATE UNIQUE INDEX "MedicineBatch_medicineId_batchNo_supplierId_key" ON "MedicineBatch"("medicineId", "batchNo", "supplierId");
