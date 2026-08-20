"use client";

import type { Category } from "@/types/category";
import { EditCategoryDialog } from "./edit-category-dialog";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useDeleteCategory } from "@/hooks/use-delete-category";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  categories: Category[];
}

export function CategoryTable({
  categories,
}: Props) {
  const deleteCategory = useDeleteCategory();

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    try {
      await deleteCategory.mutateAsync(id);
    } catch {
      alert("Failed to delete category.");
    }
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border bg-white py-16 text-center">
        <h3 className="text-lg font-semibold">
          No categories found
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          Add your first category to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">
                {category.name}
              </TableCell>

              <TableCell>
                {category.description ?? "-"}
              </TableCell>

              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <EditCategoryDialog
  category={category}
/>

                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() =>
                      handleDelete(category.id)
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}