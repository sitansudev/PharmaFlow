import { useMutation, useQueryClient } from "@tanstack/react-query";

import { purchaseService } from "@/services/purchase.service";

export function useDeletePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      purchaseService.delete(id),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["purchases"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["suppliers"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["medicines"],
        }),
      ]);
    },
  });
}