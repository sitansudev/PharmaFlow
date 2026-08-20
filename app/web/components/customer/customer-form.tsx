"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useCreateCustomer } from "@/hooks/use-create-customer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),

  phone: z.string().optional(),

  email: z
    .union([
      z.string().email("Enter a valid email"),
      z.literal(""),
    ])
    .optional(),

  address: z.string().optional(),

  dueAmount: z
    .string()
    .refine(
      (value) =>
        value === "" ||
        (!Number.isNaN(Number(value)) &&
          Number(value) >= 0),
      "Due amount must be a valid positive amount"
    ),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface Props {
  onSuccess?: () => void;
}

export function CustomerForm({ onSuccess }: Props) {
  const createCustomer = useCreateCustomer();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
    },
  });

  async function onSubmit(data: CustomerFormData) {
    try {
      await createCustomer.mutateAsync({
        name: data.name,
        phone: data.phone || undefined,
        email: data.email || undefined,
        address: data.address || undefined,
        dueAmount: data.dueAmount || "0",
      });

      toast.success("Customer created successfully");

      reset();
      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Failed to create customer"
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      <div className="space-y-2">
        <Label>Name</Label>

        <Input
          placeholder="Customer name"
          {...register("name")}
        />

        {errors.name && (
          <p className="text-sm text-red-500">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Phone</Label>

        <Input
          placeholder="Phone number"
          {...register("phone")}
        />

        {errors.phone && (
          <p className="text-sm text-red-500">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Email</Label>

        <Input
          type="email"
          placeholder="customer@example.com"
          {...register("email")}
        />

        {errors.email && (
          <p className="text-sm text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Address</Label>

        <Input
          placeholder="Customer address"
          {...register("address")}
        />

        {errors.address && (
          <p className="text-sm text-red-500">
            {errors.address.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
  <Label>Due Amount</Label>

  <Input
    type="number"
    min="0"
    step="0.01"
    placeholder="0.00"
    {...register("dueAmount")}
  />

  {errors.dueAmount && (
    <p className="text-sm text-red-500">
      {errors.dueAmount.message}
    </p>
  )}
</div>

      <Button
        type="submit"
        className="w-full"
        disabled={createCustomer.isPending}
      >
        {createCustomer.isPending
          ? "Creating..."
          : "Create Customer"}
      </Button>
    </form>
  );
}
