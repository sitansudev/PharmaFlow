import { useQuery } from "@tanstack/react-query";

import { supplierService } from "@/services/supplier.service";

export function useSupplierLedger(
  supplierId: string | null
) {
  return useQuery({
    queryKey: ["supplier-ledger", supplierId],
    queryFn: () =>
      supplierService.getLedger(supplierId!),
    enabled: Boolean(supplierId),
  });
}