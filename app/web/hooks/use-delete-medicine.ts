import { useMutation, useQueryClient } from "@tanstack/react-query";

import { medicineService } from "@/services/medicine.service";

export function useDeleteMedicine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      medicineService.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["medicines"],
      });
    },
  });
}