"use client";

import { AddCategoryDialog } from "@/components/category/add-category-dialog";
import { CategoryTable } from "@/components/category/category-table";

import { useCategories } from "@/hooks/use-categories";

export default function CategoriesPage() {
  const { data, isLoading, isError } = useCategories();

  if (isLoading) {
    return (
      <div className="p-8">
        Loading...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-red-500">
        Failed to load categories.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Categories
          </h1>

          <p className="text-muted-foreground">
            Manage medicine categories.
          </p>
        </div>

        <AddCategoryDialog />
      </div>

      <CategoryTable
        categories={data.data}
      />
    </div>
  );
}