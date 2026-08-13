import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { medicineService } from "@/services/medicine.service";

export interface QuickCreateMedicine {
  name: string;
  genericName?: string;
  categoryId?: string;
  barcode?: string;
}

export function useQuickCreateMedicine() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data: QuickCreateMedicine
    ) =>
      medicineService.quickCreate(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["medicines"],
      });
    },
  });
}