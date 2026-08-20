import { useMutation, useQueryClient } from "@tanstack/react-query";

import { categoryService } from "@/services/category.service";

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      categoryService.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
    },
  });
}