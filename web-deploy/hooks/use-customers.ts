import { useQuery } from "@tanstack/react-query";

import { customerService } from "@/services/customer.service";

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: customerService.getAll,
  });
}
