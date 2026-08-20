"use client";

import Link from "next/link";

import type { Sale } from "@/types/sale";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

interface Props {
  sales: Sale[];
}

export function SaleTable({ sales }: Props) {
  if (sales.length === 0) {
    return (
      <div className="rounded-xl border bg-white py-16 text-center">
        <h3 className="text-lg font-semibold">
          No sales found
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          Create your first sale.
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
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">
              Total
            </TableHead>
            <TableHead className="text-right">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell className="font-semibold">
                {sale.invoiceNo}
              </TableCell>

              <TableCell>
                {sale.customer?.name ?? "Walk-in"}
              </TableCell>

              <TableCell>
                {new Date(
                  sale.saleDate
                ).toLocaleDateString()}
              </TableCell>

              <TableCell>
                {sale.items.length}
              </TableCell>

              <TableCell>
                {sale.paymentMethod}
              </TableCell>

              <TableCell>
                {sale.paymentStatus}
              </TableCell>

              <TableCell className="text-right font-semibold">
                ₹{Number(sale.totalAmount).toFixed(2)}
              </TableCell>

              <TableCell className="text-right">
                <Link href={`/sales/${sale.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    View
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}