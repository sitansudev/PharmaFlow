import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { medicineService } from "@/services/medicine.service";

import type {
  CreateMedicine,
} from "@/types/medicine";

export function useCreateMedicine() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateMedicine
    ) => medicineService.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["medicines"],
      });
    },
  });
}