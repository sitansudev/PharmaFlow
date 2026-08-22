"use client";

import { useState } from "react";

import type { Purchase } from "@/types/purchase";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import { useDeletePurchase } from "@/hooks/use-delete-purchase";

interface Props {
  purchases: Purchase[];
}

export function PurchaseTable({
  purchases,
}: Props) {
  const deletePurchase =
    useDeletePurchase();

  const [purchaseToDelete, setPurchaseToDelete] =
    useState<Purchase | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  if (purchases.length === 0) {
    return (
      <div className="rounded-xl border bg-white py-16 text-center">
        <h3 className="text-lg font-semibold">
          No purchases found
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          Create your first purchase.
        </p>
      </div>
    );
  }

  async function handleDelete() {
    if (!purchaseToDelete) {
      return;
    }

    setErrorMessage(null);

    try {
      await deletePurchase.mutateAsync(
        purchaseToDelete.id
      );

      setPurchaseToDelete(null);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        "Failed to delete purchase.";

      setErrorMessage(message);
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                Invoice
              </TableHead>

              <TableHead>
                Supplier
              </TableHead>

              <TableHead>
                Date
              </TableHead>

              <TableHead>
                Items
              </TableHead>

              <TableHead className="text-right">
                Total
              </TableHead>

              <TableHead className="text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell className="font-semibold">
                  {purchase.invoiceNo}
                </TableCell>

                <TableCell>
                  {purchase.supplier.name}
                </TableCell>

                <TableCell>
                  {new Date(
                    purchase.purchaseDate
                  ).toLocaleDateString()}
                </TableCell>

                <TableCell>
                  {purchase.items.length}
                </TableCell>

                <TableCell className="text-right font-semibold">
                  ₹
                  {Number(
                    purchase.totalAmount
                  ).toFixed(2)}
                </TableCell>

                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      setPurchaseToDelete(
                        purchase
                      )
                    }
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {purchaseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold">
              Delete purchase?
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              You are about to delete purchase invoice{" "}
              <span className="font-semibold text-foreground">
                {purchaseToDelete.invoiceNo}
              </span>
              .
            </p>

            <p className="mt-3 text-sm text-red-600">
              This will reverse its stock and supplier
              ledger entry. If any stock from this
              purchase has already been sold, deletion
              will be blocked.
            </p>

            {errorMessage && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={
                  deletePurchase.isPending
                }
                onClick={() => {
                  setPurchaseToDelete(null);
                  setErrorMessage(null);
                }}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="destructive"
                disabled={
                  deletePurchase.isPending
                }
                onClick={handleDelete}
              >
                {deletePurchase.isPending
                  ? "Deleting..."
                  : "Delete Purchase"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}