"use client";

import { useParams } from "next/navigation";
import { useSale } from "@/hooks/use-sale";

const PHARMACY_NAME = "CHAUDHARY MEDICAL HALL";
const PHARMACY_ADDRESS = "Karsiya Bazzar";
const PAN_NUMBER = "300953277";

export default function SaleBillPage() {
  const params = useParams<{ id: string }>();

  const {
    data,
    isLoading,
    isError,
  } = useSale(params.id);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading bill...
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">
          Unable to load bill.
        </p>
      </div>
    );
  }

  const sale = data.data;

  /*
   * totalAmount = final payable amount
   * discount = actual discount in rupees
   *
   * Therefore:
   *
   * Current Total = totalAmount + discount
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
    <>
      {/* Screen controls */}

      <div className="print:hidden flex justify-center gap-3 p-6">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-lg border px-4 py-2 text-sm"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-black px-4 py-2 text-sm text-white"
        >
          🖨 Print Bill
        </button>
      </div>

      {/* Receipt */}

      <main className="mx-auto w-[80mm] bg-white px-3 py-4 text-black">
        {/* Header */}

        <header className="text-center">
          <h1 className="text-lg font-bold uppercase">
            {PHARMACY_NAME}
          </h1>

          <p className="mt-1 text-xs">
            {PHARMACY_ADDRESS}
          </p>

          <p className="mt-1 text-xs font-semibold">
            PAN: {PAN_NUMBER}
          </p>
        </header>

        <div className="my-3 border-t border-dashed border-black" />

        {/* Invoice information */}

        <section className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Invoice</span>

            <span className="font-semibold">
              {sale.invoiceNo}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Date</span>

            <span>
              {new Date(
                sale.saleDate
              ).toLocaleDateString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Customer</span>

            <span>
              {sale.customer?.name ??
                "Walk-in"}
            </span>
          </div>
        </section>

        <div className="my-3 border-t border-dashed border-black" />

        {/* Items */}

        <section>
          <div className="grid grid-cols-[1fr_42px_42px_24px_52px] gap-1 text-[10px] font-bold">
            <span>Medicine</span>

            <span>Batch</span>

            <span>Expiry</span>

            <span className="text-right">
              Qty
            </span>

            <span className="text-right">
              Amount
            </span>
          </div>

          <div className="my-2 border-t border-dashed border-black" />

          <div className="space-y-2">
            {sale.items.map(
              (item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_42px_42px_24px_52px] gap-1 text-[10px]"
                >
                  <span className="break-words font-medium">
                    {
                      item.batch
                        .medicine
                        .name
                    }
                  </span>

                  <span>
                    {
                      item.batch
                        .batchNo
                    }
                  </span>

                  <span>
                    {new Date(
                      item.batch
                        .expiryDate
                    ).toLocaleDateString(
                      "en-GB",
                      {
                        month:
                          "2-digit",
                        year:
                          "numeric",
                      }
                    )}
                  </span>

                  <span className="text-right">
                    {item.quantity}
                  </span>

                  <span className="text-right font-semibold">
                    ₹
                    {Number(
                      item.subtotal
                    ).toFixed(2)}
                  </span>
                </div>
              )
            )}
          </div>
        </section>

        <div className="my-3 border-t border-dashed border-black" />

        {/* Totals */}

        <section className="space-y-1 text-xs">
          {/* Number of items */}

          <div className="flex justify-between">
            <span>Items</span>

            <span>
              {sale.items.reduce(
                (
                  total,
                  item
                ) =>
                  total +
                  item.quantity,
                0
              )}
            </span>
          </div>

          {/* Current Total */}

          <div className="flex justify-between">
            <span>
              Current Total
            </span>

            <span>
              ₹
              {currentTotal.toFixed(
                2
              )}
            </span>
          </div>

          {/* Discount */}

          {discount > 0 ? (
            <div className="flex justify-between">
              <span>
                Discount
                {discountPercent >
                0
                  ? ` (${discountPercent}%)`
                  : ""}
              </span>

              <span>
                - ₹
                {discount.toFixed(
                  2
                )}
              </span>
            </div>
          ) : (
            <div className="flex justify-between">
              <span>
                Discount
              </span>

              <span>
                ₹0.00
              </span>
            </div>
          )}

          <div className="my-2 border-t border-dashed border-black" />

          {/* Final Total */}

          <div className="flex justify-between text-base font-bold">
            <span>
              TOTAL
            </span>

            <span>
              ₹
              {finalTotal.toFixed(
                2
              )}
            </span>
          </div>
        </section>

        <div className="my-3 border-t border-dashed border-black" />

        {/* Payment */}

        <section className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>
              Payment
            </span>

            <span className="font-semibold">
              {sale.paymentMethod}
            </span>
          </div>

<div className="flex justify-between">
  <span>
    Status
  </span>

  <span className="font-semibold">
    {sale.paymentStatus}
  </span>
</div>
        </section>

        <div className="my-4 border-t border-dashed border-black" />

        {/* Footer */}

        <footer className="text-center text-xs">
          <p className="font-semibold">
            Thank You!
          </p>

          <p className="mt-1">
            Visit Again
          </p>
        </footer>
      </main>

      {/* Thermal printer CSS */}

      <style jsx global>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }

          html,
          body {
            width: 80mm;
            margin: 0;
            padding: 0;
            background: white;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </>
  );
}