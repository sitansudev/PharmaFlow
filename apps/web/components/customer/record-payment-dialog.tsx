"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { Customer } from "@/types/customer";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useRecordPayment } from "@/hooks/use-record-payment";

interface Props {
  customer: Customer;
}

export function RecordPaymentDialog({
  customer,
}: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");

  const recordPayment = useRecordPayment();

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const payment = Number(amount);
    const due = Number(customer.dueAmount);

    if (!Number.isFinite(payment) || payment <= 0) {
      toast.error(
        "Enter a valid payment amount"
      );
      return;
    }

    if (payment > due) {
      toast.error(
        "Payment cannot be greater than the due amount"
      );
      return;
    }

    try {
      await recordPayment.mutateAsync({
        id: customer.id,
        amount: payment.toFixed(2),
      });

      toast.success(
        "Payment recorded successfully"
      );

      setAmount("");
      setOpen(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Failed to record payment"
      );
    }
  }

  function handleOpenChange(
    nextOpen: boolean
  ) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setAmount("");
    }
  }

  const due = Number(customer.dueAmount);

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            disabled={due <= 0}
          >
            💰 Payment
          </Button>
        }
      />

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Record Payment
          </DialogTitle>

          <DialogDescription>
            Record money received from{" "}
            <strong>{customer.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="text-sm text-muted-foreground">
              Current Due
            </p>

            <p className="mt-1 text-2xl font-bold">
              Rs. {due.toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            <Label>
              Payment Amount
            </Label>

            <Input
              type="number"
              min="0.01"
              max={due}
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              autoFocus
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              recordPayment.isPending
            }
          >
            {recordPayment.isPending
              ? "Recording..."
              : "Record Payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}