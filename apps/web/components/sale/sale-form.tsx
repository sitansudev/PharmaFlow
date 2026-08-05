"use client";

import { useMemo } from "react";

import { useFieldArray, useForm } from "react-hook-form";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

import { useCreateSale } from "@/hooks/use-create-sale";
import { useMedicines } from "@/hooks/use-medicines";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const saleSchema = z.object({
  invoiceNo: z.string().min(1),

  customerId: z.string().optional().default(""),

  items: z.array(
    z.object({
      batchId: z.string().min(1),

      quantity: z.coerce.number().min(1),
    })
  ).min(1),
});

type SaleFormInput = z.input<typeof saleSchema>;
type SaleFormData = z.output<typeof saleSchema>;

interface SaleFormProps {
  onSuccess?: () => void;
}

export function SaleForm({
  onSuccess,
}: SaleFormProps) {

  const createSale = useCreateSale();

  

  const { data: medicines } = useMedicines();

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SaleFormInput, any, SaleFormData>({
    resolver: zodResolver(saleSchema),

    defaultValues: {
      invoiceNo: `INV-${Date.now()}`,

      customerId: "",

      items: [
        {
          batchId: "",

          quantity: 1,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items");

  const grandTotal = useMemo(() => {
    return 0;
  }, [items]);