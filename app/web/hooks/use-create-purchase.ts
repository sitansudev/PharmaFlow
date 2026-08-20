import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { purchaseService } from "@/services/purchase.service";
import type { CreatePurchase } from "@/types/purchase";

export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePurchase) =>
      purchaseService.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["purchases"],
      });

      queryClient.invalidateQueries({
        queryKey: ["medicines"],
      });
    },
  });
}