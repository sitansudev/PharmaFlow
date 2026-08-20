import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { customerService } from "@/services/customer.service";

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerService.delete,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
    },
  });
}