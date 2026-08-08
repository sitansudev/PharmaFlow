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

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}

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

  <Link href={`/sales/${sale.id}/bill`}>
    <Button>
      🧾 Print Bill
    </Button>
  </Link>
</div>
      </div>

      {/* Sale information */}

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">
            Invoice
          </p>

          <p className="mt-1 font-semibold">
            {sale.invoiceNo}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">
            Customer
          </p>

          <p className="mt-1 font-semibold">
            {sale.customer?.name ?? "Walk-in"}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">
            Payment
          </p>

          <p className="mt-1 font-semibold">
            {sale.paymentMethod}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">
            Total
          </p>

          <p className="mt-1 text-xl font-bold">
            ₹{Number(sale.totalAmount).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Items */}

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
                  Rate
                </th>

                <th className="px-5 py-3 text-right">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {sale.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b last:border-0"
                >
                  <td className="px-5 py-4 font-medium">
                    {item.batch.medicine.name}
                  </td>

                  <td className="px-5 py-4">
                    {item.batch.batchNo}
                  </td>

                  <td className="px-5 py-4">
                    {new Date(
                      item.batch.expiryDate
                    ).toLocaleDateString()}
                  </td>

                  <td className="px-5 py-4 text-right">
                    {item.quantity}
                  </td>

                  <td className="px-5 py-4 text-right">
                    ₹
                    {Number(
                      item.sellingPrice
                    ).toFixed(2)}
                  </td>

                  <td className="px-5 py-4 text-right font-semibold">
                    ₹
                    {Number(
                      item.subtotal
                    ).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t p-5">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              Total
            </p>

            <p className="text-2xl font-bold">
              ₹{Number(sale.totalAmount).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
