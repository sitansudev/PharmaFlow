import { SaleForm } from "@/components/sale/sale-form";

export default function NewSalePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          New Sale
        </h1>

        <p className="text-muted-foreground">
          Create a new pharmacy sale.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-8">
        <h2 className="mb-6 text-xl font-semibold">
          Sales POS
        </h2>

        <SaleForm />
      </div>
    </div>
  );
}