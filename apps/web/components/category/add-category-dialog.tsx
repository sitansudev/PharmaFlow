"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { CategoryForm } from "./category-form";

export function AddCategoryDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger
        render={
          <Button>
            + Add Category
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Add Category
          </DialogTitle>

          <DialogDescription>
            Create a new medicine category.
          </DialogDescription>
        </DialogHeader>

        <CategoryForm
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}