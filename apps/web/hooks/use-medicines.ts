import { useQuery } from "@tanstack/react-query";

import { medicineService } from "@/services/medicine.service";

export function useMedicines(
  limit = 10,
  search = "",
  page = 1
) {
  return useQuery({
    queryKey: ["medicines", limit, search, page],
    queryFn: () =>
      medicineService.getAll(
        limit,
        search,
        page
      ),
    placeholderData: (previousData) =>
      previousData,
  });
}