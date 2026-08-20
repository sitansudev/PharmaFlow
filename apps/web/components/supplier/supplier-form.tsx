"use client";

import { useEffect } from "react";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useCreateSupplier } from "@/hooks/use-create-supplier";
import { useUpdateSupplier } from "@/hooks/use-update-supplier";

import type { Supplier } from "@/types/supplier";

const schema = z.object({
  name: z.string().min(2, "Supplier name is required"),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  panNo: z.string().optional(),
  address: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface SupplierFormProps {
  supplier?: Supplier;
  onSuccess?: () => void;
}

export function SupplierForm({
  supplier,
  onSuccess,
}: SupplierFormProps) {
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      panNo: "",
      address: "",
    },
  });

  useEffect(() => {
    if (supplier) {
      reset({
        name: supplier.name,
        phone: supplier.phone,
        email: supplier.email ?? "",
        panNo: supplier.panNo ?? "",
        address: supplier.address ?? "",
      });
    }
  }, [supplier, reset]);

  async function onSubmit(values: FormData) {
    if (supplier) {
      await updateSupplier.mutateAsync({
        id: supplier.id,
        data: values,
      });
    } else {
      await createSupplier.mutateAsync(values);
      reset();
    }

    onSuccess?.();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      <div className="grid grid-cols-2 gap-4">
        {/* Supplier Name */}

        <div>
          <Label>Supplier Name</Label>

          <Input {...register("name")} />

          <p className="mt-1 text-xs text-red-500">
            {errors.name?.message}
          </p>
        </div>

        {/* Phone */}

        <div>
          <Label>Phone</Label>

          <Input {...register("phone")} />

          <p className="mt-1 text-xs text-red-500">
            {errors.phone?.message}
          </p>
        </div>

        {/* Email */}

        <div>
          <Label>Email</Label>

          <Input {...register("email")} />
        </div>

        {/* PAN */}

        <div>
          <Label>PAN No.</Label>

          <Input
            {...register("panNo")}
            placeholder="PAN number"
          />
        </div>

        {/* Address */}

        <div className="col-span-2">
          <Label>Address</Label>

          <Input {...register("address")} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {supplier
            ? "Update Supplier"
            : "Save Supplier"}
        </Button>
      </div>
    </form>
  );
}