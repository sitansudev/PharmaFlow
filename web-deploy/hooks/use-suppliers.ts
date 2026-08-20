import { useQuery } from "@tanstack/react-query";

import { supplierService } from "@/services/supplier.service";

export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: supplierService.getAll,
  });
}