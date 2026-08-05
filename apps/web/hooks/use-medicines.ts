import { useQuery } from "@tanstack/react-query";

import { medicineService } from "@/services/medicine.service";

export function useMedicines() {
  return useQuery({
    queryKey: ["medicines"],
    queryFn: medicineService.getAll,
  });
}