import { useQuery } from "@tanstack/react-query";

import { purchaseService } from "@/services/purchase.service";

export function usePurchases() {
  return useQuery({
    queryKey: ["purchases"],
    queryFn: purchaseService.getAll,
  });
}