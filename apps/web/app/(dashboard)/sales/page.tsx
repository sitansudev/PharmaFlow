import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function SalesPage() {
  return (
    <div className="space-y-8">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Sales
          </h1>

          <p className="text-muted-foreground">
            Manage pharmacy sales.
          </p>
        </div>

        <Link href="/sales/new">
  <Button>
    + New Sale
  </Button>
</Link>

      </div>

      <div className="rounded-xl border bg-white p-20 text-center">

        <h2 className="text-xl font-semibold">
          Sales History
        </h2>

        <p className="mt-2 text-muted-foreground">
          Sales table coming next.
        </p>

      </div>

    </div>
  );
}