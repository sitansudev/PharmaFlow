"use client";

import { useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { Supplier } from "@/types/supplier";
import { useSupplierLedger } from "@/hooks/use-supplier-ledger";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { SupplierPaymentDialog } from "./supplier-payment-dialog";

interface Props {
  supplier: Supplier;
}

export function SupplierLedgerDialog({
  supplier,
}: Props) {
  const [open, setOpen] = useState(false);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useSupplierLedger(
    open ? supplier.id : null
  );

  function formatCurrency(value: number) {
    return `₹${Math.round(Number(value) || 0)}`;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          />
        }
      >
        <BookOpen className="h-4 w-4" />
        Ledger
      </DialogTrigger>

      <DialogContent className="!w-[95vw] !max-w-[1200px]">
        <DialogHeader>
          <DialogTitle>
            {supplier.name} — Supplier Ledger
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {isError && (
          <div className="py-8 text-center text-red-600">
            Failed to load supplier ledger.
          </div>
        )}

        {data && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">
                  Total Debit
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {formatCurrency(
                    data.data.totals.debit
                  )}
                </p>
              </div>

              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">
                  Total Credit
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {formatCurrency(
                    data.data.totals.credit
                  )}
                </p>
              </div>

              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">
                  Outstanding Balance
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {formatCurrency(
                    data.data.totals.balance
                  )}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <SupplierPaymentDialog
                supplier={supplier}
                onSuccess={() => {
                  refetch();

                  toast.success(
                    "Supplier payment recorded successfully"
                  );
                }}
              />
            </div>

            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left">
                      Date
                    </th>

                    <th className="px-4 py-3 text-left">
                      Unique No.
                    </th>

                    <th className="px-4 py-3 text-left">
                      Invoice / Bill No.
                    </th>

                    <th className="px-4 py-3 text-right">
                      Debit
                    </th>

                    <th className="px-4 py-3 text-right">
                      Credit
                    </th>

                    <th className="px-4 py-3 text-right">
                      Balance
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.data.entries.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-muted-foreground"
                      >
                        No ledger entries yet.
                      </td>
                    </tr>
                  ) : (
                    data.data.entries.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b last:border-0"
                      >
                        <td className="px-4 py-3">
                          {new Date(
                            entry.date
                          ).toLocaleDateString()}
                        </td>

                        <td className="px-4 py-3">
                          {entry.uniqueNumber || "-"}
                        </td>

                        <td className="px-4 py-3 font-medium">
                          {entry.invoiceNumber}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {entry.debit > 0
                            ? formatCurrency(
                                entry.debit
                              )
                            : "-"}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {entry.credit > 0
                            ? formatCurrency(
                                entry.credit
                              )
                            : "-"}
                        </td>

                        <td className="px-4 py-3 text-right font-semibold">
                          {formatCurrency(
                            entry.balance
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}