import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { saleService } from "@/services/sale.service";

import type { CreateSaleInput } from "@/types/sale";

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSaleInput) =>
      saleService.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sales"],
      });

      queryClient.invalidateQueries({
        queryKey: ["medicines"],
      });
    },
  });
}