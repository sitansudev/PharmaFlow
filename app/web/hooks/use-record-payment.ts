import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { customerService } from "@/services/customer.service";

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      amount,
    }: {
      id: string;
      amount: string;
    }) =>
      customerService.recordPayment(
        id,
        amount
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
    },
  });
}