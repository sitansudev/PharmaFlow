import { useQuery } from "@tanstack/react-query";

import { saleService } from "@/services/sale.service";

export function useSale(id: string) {
  return useQuery({
    queryKey: ["sale", id],
    queryFn: () => saleService.getById(id),
    enabled: Boolean(id),
  });
}
