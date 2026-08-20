"use client";

import { useEffect } from "react";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useCreateCategory } from "@/hooks/use-create-category";
import { useUpdateCategory } from "@/hooks/use-update-category";

import type { Category } from "@/types/category";

const schema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters"),

  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CategoryFormProps {
  category?: Category;
  onSuccess?: () => void;
}

export function CategoryForm({
  category,
  onSuccess,
}: CategoryFormProps) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description ?? "",
      });
    }
  }, [category, reset]);

  async function onSubmit(values: FormData) {
    if (category) {
      await updateCategory.mutateAsync({
        id: category.id,
        data: values,
      });
    } else {
      await createCategory.mutateAsync(values);
      reset();
    }

    onSuccess?.();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      <div>
        <Label>Category Name</Label>

        <Input
          placeholder="Pain Killer"
          {...register("name")}
        />

        <p className="mt-1 text-xs text-red-500">
          {errors.name?.message}
        </p>
      </div>

      <div>
        <Label>Description</Label>

        <Input
          placeholder="Optional"
          {...register("description")}
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {category ? "Update Category" : "Save Category"}
        </Button>
      </div>
    </form>
  );
}