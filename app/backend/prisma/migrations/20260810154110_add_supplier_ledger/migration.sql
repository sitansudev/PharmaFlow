-- CreateEnum
CREATE TYPE "SupplierLedgerEntryType" AS ENUM ('PURCHASE', 'PAYMENT');

-- CreateTable
CREATE TABLE "SupplierLedgerEntry" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uniqueNumber" TEXT,
    "invoiceNumber" TEXT NOT NULL,
    "type" "SupplierLedgerEntryType" NOT NULL,
    "debit" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "credit" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paymentMethod" "PaymentMethod",
    "referenceId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SupplierLedgerEntry_supplierId_date_idx" ON "SupplierLedgerEntry"("supplierId", "date");

-- CreateIndex
CREATE INDEX "SupplierLedgerEntry_supplierId_type_idx" ON "SupplierLedgerEntry"("supplierId", "type");

-- CreateIndex
CREATE INDEX "SupplierLedgerEntry_invoiceNumber_idx" ON "SupplierLedgerEntry"("invoiceNumber");

-- AddForeignKey
ALTER TABLE "SupplierLedgerEntry" ADD CONSTRAINT "SupplierLedgerEntry_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
