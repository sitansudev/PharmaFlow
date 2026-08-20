"use client";

import { useState } from "react";

import type { Medicine } from "@/types/medicine";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

import { MedicineForm } from "./medicine-form";

interface Props {
  medicine: Medicine;
}

export function EditMedicineDialog({
  medicine,
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
            Edit Medicine
          </DialogTitle>

          <DialogDescription>
            Update medicine details.
          </DialogDescription>
        </DialogHeader>

        <MedicineForm
          medicine={medicine}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}