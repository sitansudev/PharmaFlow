import {
  CalendarClock,
  PackageCheck,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Medicine {
  id: string;
  name: string;
  batchNo: string;
  stock: number;
  expiryDate: string;
}

interface Props {
  medicines: Medicine[];
}

export function ExpiringMedicines({
  medicines,
}: Props) {
  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
            <CalendarClock className="h-5 w-5 text-red-600" />
          </div>

          <div>
            <CardTitle className="text-base">
              Near Expiry Medicines
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Medicines approaching their expiry date
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-600">
          {medicines.length}
        </span>
      </CardHeader>

      <CardContent className="p-0">
        {medicines.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
              <PackageCheck className="h-6 w-6 text-green-600" />
            </div>

            <p className="mt-4 font-medium">
              No expiry concerns
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              No medicines are nearing expiry.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Medicine
                  </th>

                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Batch
                  </th>

                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Stock
                  </th>

                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Expiry Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {medicines.map((medicine) => (
                  <tr
                    key={medicine.id}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="max-w-[300px] px-6 py-4">
                      <div
                        className="truncate font-medium"
                        title={medicine.name}
                      >
                        {medicine.name}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-muted-foreground">
                      {medicine.batchNo}
                    </td>

                    <td className="px-6 py-4 font-semibold">
                      {medicine.stock}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                        {new Date(
                          medicine.expiryDate
                        ).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}