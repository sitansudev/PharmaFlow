import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { medicineService } from "@/services/medicine.service";

import type {
  UpdateMedicine,
} from "@/types/medicine";

export function useUpdateMedicine() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateMedicine;
    }) =>
      medicineService.update(
        id,
        data
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["medicines"],
      });
    },
  });
}