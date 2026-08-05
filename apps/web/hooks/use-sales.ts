import { useQuery } from "@tanstack/react-query";

import { saleService } from "@/services/sale.service";

export function useSales() {
  return useQuery({
    queryKey: ["sales"],
    queryFn: saleService.getAll,
  });
}