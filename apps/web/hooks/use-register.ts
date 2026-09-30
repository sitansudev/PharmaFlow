"use client";

import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";

export function useRegister() {
  return useMutation({ mutationFn: authService.register });
}
