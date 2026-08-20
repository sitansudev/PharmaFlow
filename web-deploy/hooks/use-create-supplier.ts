import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supplierService } from "@/services/supplier.service";

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: supplierService.create,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["suppliers"],
      });
    },
  });
}