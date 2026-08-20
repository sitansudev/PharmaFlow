import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supplierService } from "@/services/supplier.service";

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      supplierService.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["suppliers"],
      });
    },
  });
}