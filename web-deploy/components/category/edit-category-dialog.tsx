"use client";

import { useState } from "react";

import type { Category } from "@/types/category";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Pencil } from "lucide-react";

import { CategoryForm } from "./category-form";

interface Props {
  category: Category;
}

export function EditCategoryDialog({
  category,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="icon"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Edit Category
          </DialogTitle>

          <DialogDescription>
            Update category details.
          </DialogDescription>
        </DialogHeader>

        <CategoryForm
          category={category}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}