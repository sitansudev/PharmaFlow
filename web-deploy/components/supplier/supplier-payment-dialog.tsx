"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import type { Supplier } from "@/types/supplier";
import { supplierService } from "@/services/supplier.service";
import { useSupplierLedger } from "@/hooks/use-supplier-ledger";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  supplier: Supplier;
  onSuccess: () => void;
}

type PaymentMethod =
  | "CASH"
  | "UPI"
  | "CARD"
  | "ESEWA"
  | "FONEPAY";

export function SupplierPaymentDialog({
  supplier,
  onSuccess,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [uniqueNumber, setUniqueNumber] =
    useState("");

  const [invoiceNumber, setInvoiceNumber] =
    useState("");

  const [amount, setAmount] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CASH");

  const [notes, setNotes] = useState("");

  const {
    data: ledgerData,
  } = useSupplierLedger(
    open ? supplier.id : null
  );

  const outstandingBalance =
    ledgerData?.data.totals.balance ?? 0;

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const paymentAmount = Number(amount);

    if (!invoiceNumber.trim()) {
      toast.error("Bill number is required");
      return;
    }

    if (
      !Number.isFinite(paymentAmount) ||
      paymentAmount <= 0
    ) {
      toast.error(
        "Payment amount must be greater than zero"
      );
      return;
    }

    if (paymentAmount > outstandingBalance) {
      toast.error(
        `Payment cannot exceed outstanding balance of ₹${outstandingBalance.toFixed(
          2
        )}`
      );
      return;
    }

    try {
      setIsSubmitting(true);

      await supplierService.recordPayment(
        supplier.id,
        {
          date,
          uniqueNumber:
            uniqueNumber.trim() || undefined,
          invoiceNumber: invoiceNumber.trim(),
          amount: paymentAmount,
          paymentMethod,
          notes: notes.trim() || undefined,
        }
      );

      toast.success(
        "Supplier payment recorded successfully"
      );

      setUniqueNumber("");
      setInvoiceNumber("");
      setAmount("");
      setPaymentMethod("CASH");
      setNotes("");

      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Failed to record supplier payment"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger
  render={
    <Button className="gap-2" />
  }
>
  <Plus className="h-4 w-4" />
  Record Payment
</DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Record Supplier Payment
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              Supplier
            </p>

            <p className="font-semibold">
              {supplier.name}
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Outstanding Balance
            </p>

            <p className="text-xl font-bold">
              ₹{outstandingBalance.toFixed(2)}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="payment-date">
                Date
              </Label>

              <Input
                id="payment-date"
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unique-number">
                Unique Number
                <span className="ml-1 text-muted-foreground">
                  (Optional)
                </span>
              </Label>

              <Input
                id="unique-number"
                value={uniqueNumber}
                onChange={(event) =>
                  setUniqueNumber(event.target.value)
                }
                placeholder="e.g. A2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bill-number">
              Bill Number
            </Label>

            <Input
              id="bill-number"
              value={invoiceNumber}
              onChange={(event) =>
                setInvoiceNumber(event.target.value)
              }
              placeholder="e.g. BILL-001"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">
                Amount
              </Label>

              <Input
                id="payment-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-method">
                Payment Method
              </Label>

              <select
                id="payment-method"
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(
                    event.target.value as PaymentMethod
                  )
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="CASH">
                  Cash
                </option>

                <option value="UPI">
                  UPI
                </option>

                <option value="CARD">
                  Card
                </option>

                <option value="ESEWA">
                  eSewa
                </option>

                <option value="FONEPAY">
                  Fonepay
                </option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-notes">
              Notes
              <span className="ml-1 text-muted-foreground">
                (Optional)
              </span>
            </Label>

            <Input
              id="payment-notes"
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              placeholder="Optional notes"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Record Payment"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}