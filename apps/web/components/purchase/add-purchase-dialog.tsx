"use client";

import { useState } from "react";

import { PurchaseForm } from "./purchase-form";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AddPurchaseDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger
        render={
          <Button>
            + Add Purchase
          </Button>
        }
      />

      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            Create Purchase
          </DialogTitle>

          <DialogDescription>
            Receive medicines from supplier.
          </DialogDescription>
        </DialogHeader>

        <PurchaseForm
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}