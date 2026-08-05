"use client";

import { useState } from "react";

import { MedicineForm } from "@/components/medicine/medicine-form";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AddMedicineDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger
        render={
          <Button>
            + Add Medicine
          </Button>
        }
      />

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Add Medicine
          </DialogTitle>

          <DialogDescription>
            Fill in the medicine details below.
          </DialogDescription>
        </DialogHeader>

        <MedicineForm
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}