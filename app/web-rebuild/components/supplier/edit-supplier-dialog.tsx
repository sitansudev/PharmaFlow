"use client";

import { useState } from "react";

import type { Supplier } from "@/types/supplier";

import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { SupplierForm } from "./supplier-form";

interface Props {
  supplier: Supplier;
}

export function EditSupplierDialog({
  supplier,
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

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Edit Supplier
          </DialogTitle>

          <DialogDescription>
            Update supplier details.
          </DialogDescription>
        </DialogHeader>

        <SupplierForm
          supplier={supplier}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}