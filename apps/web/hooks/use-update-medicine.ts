import { useMutation, useQueryClient } from "@tanstack/react-query";

import { medicineService } from "@/services/medicine.service";

export function useUpdateMedicine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: any;
    }) => medicineService.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["medicines"],
      });
    },
  });
}