import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { customerService } from "@/services/customer.service";

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerService.create,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
    },
  });
}