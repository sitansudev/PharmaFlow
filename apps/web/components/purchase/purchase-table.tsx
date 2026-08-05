"use client";

import type { Purchase } from "@/types/purchase";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  purchases: Purchase[];
}

export function PurchaseTable({
  purchases,
}: Props) {
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

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="text-right">
              Total
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
                ₹{Number(
                  purchase.totalAmount
                ).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
