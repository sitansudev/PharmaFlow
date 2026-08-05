import { useMutation, useQueryClient } from "@tanstack/react-query";

import { medicineService } from "@/services/medicine.service";

export function useCreateMedicine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: medicineService.create,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["medicines"],
      });
    },
  });
}