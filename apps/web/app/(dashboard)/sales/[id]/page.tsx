"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useSale } from "@/hooks/use-sale";

export default function SaleDetailPage() {
  const params = useParams<{ id: string }>();

  const {
    data,
    isLoading,
    isError,
  } = useSale(params.id);

  if (isLoading) {
    return (
      <div className="p-8">
        Loading sale...
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="space-y-4 p-8">
        <h1 className="text-2xl font-bold">
          Sale not found
        </h1>

        <Link href="/sales">
          <Button variant="outline">
            Back to Sales
          </Button>
        </Link>
      </div>
    );
  }

  const sale = data.data;

  /*
   * totalAmount is the final amount after discount.
   *
   * Therefore:
   *
   * Current Total = Final Total + Discount
   */
  const finalTotal =
    Number(sale.totalAmount) || 0;

  const discount =
    Number(sale.discount ?? 0);

  const discountPercent =
    Number(
      sale.discountPercent ?? 0
    );

  const currentTotal =
    Number(
      (
        finalTotal + discount
      ).toFixed(2)
    );

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Sale {sale.invoiceNo}
          </h1>

          <p className="text-muted-foreground">
            Sale details
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/sales">
            <Button variant="outline">
              ← Back to Sales
            </Button>
          </Link>

          <Link
            href={`/sales/${sale.id}/bill`}
          >
            <Button>
              🧾 Print Bill
            </Button>
          </Link>
        </div>
      </div>

      {/* ====================================================== */}
      {/* SALE INFORMATION */}
      {/* ====================================================== */}

      <div className="grid gap-4 md:grid-cols-4">
        {/* Invoice */}

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">
            Invoice
          </p>

          <p className="mt-1 font-semibold">
            {sale.invoiceNo}
          </p>
        </div>

        {/* Customer */}

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">
            Customer
          </p>

          <p className="mt-1 font-semibold">
            {sale.customer?.name ??
              "Walk-in"}
          </p>
        </div>

        {/* Payment */}

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">
            Payment
          </p>

          <p className="mt-1 font-semibold">
            {sale.paymentMethod}
          </p>
        </div>

        {/* Grand Total */}

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">
            Grand Total
          </p>

          <p className="mt-1 text-xl font-bold">
            ₹{finalTotal.toFixed(2)}
          </p>
        </div>
      </div>

      {/* ====================================================== */}
      {/* ITEMS */}
      {/* ====================================================== */}

      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="border-b p-5">
          <h2 className="text-lg font-semibold">
            Items
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left">
                  Medicine
                </th>

                <th className="px-5 py-3 text-left">
                  Batch
                </th>

                <th className="px-5 py-3 text-left">
                  Expiry
                </th>

                <th className="px-5 py-3 text-right">
                  Qty
                </th>

                <th className="px-5 py-3 text-right">
                  MRP
                </th>

                <th className="px-5 py-3 text-right">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {sale.items.map(
                (item) => (
                  <tr
                    key={item.id}
                    className="border-b last:border-0"
                  >
                    {/* Medicine */}

                    <td className="px-5 py-4 font-medium">
                      {
                        item.batch
                          .medicine
                          .name
                      }
                    </td>

                    {/* Batch */}

                    <td className="px-5 py-4">
                      {
                        item.batch
                          .batchNo
                      }
                    </td>

                    {/* Expiry */}

                    <td className="px-5 py-4">
                      {new Date(
                        item.batch.expiryDate
                      ).toLocaleDateString()}
                    </td>

                    {/* Quantity */}

                    <td className="px-5 py-4 text-right">
                      {item.quantity}
                    </td>

                    {/* MRP */}

                    <td className="px-5 py-4 text-right">
                      ₹
                      {Number(
                        item.mrp
                      ).toFixed(2)}
                    </td>

                    {/* Amount */}

                    <td className="px-5 py-4 text-right font-semibold">
                      ₹
                      {Number(
                        item.subtotal
                      ).toFixed(2)}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* ==================================================== */}
        {/* TOTALS */}
        {/* ==================================================== */}

        <div className="border-t p-5">
          <div className="ml-auto max-w-sm space-y-3">
            {/* Current Total */}

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Current Total
              </span>

              <span className="font-medium">
                ₹
                {currentTotal.toFixed(
                  2
                )}
              </span>
            </div>

            {/* Discount */}

            {discount > 0 ? (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Discount
                  {discountPercent >
                  0
                    ? ` (${discountPercent}%)`
                    : ""}
                </span>

                <span className="font-medium text-red-600">
                  - ₹
                  {discount.toFixed(
                    2
                  )}
                </span>
              </div>
            ) : (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Discount
                </span>

                <span className="font-medium">
                  ₹0.00
                </span>
              </div>
            )}

            <div className="border-t pt-3" />

            {/* Grand Total */}

            <div className="flex justify-between">
              <span className="text-lg font-semibold">
                Grand Total
              </span>

              <span className="text-2xl font-bold">
                ₹
                {finalTotal.toFixed(
                  2
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}