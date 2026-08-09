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

export function LowStockMedicines({
  medicines,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          ⚠️ Low Stock Medicines
        </CardTitle>
      </CardHeader>

      <CardContent>
        {medicines.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            All medicines are sufficiently stocked.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">
                    Medicine
                  </th>

                  <th className="text-left">
                    Batch
                  </th>

                  <th className="text-left">
                    Stock
                  </th>

                  <th className="text-left">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {medicines.map((medicine) => (
                  <tr
                    key={medicine.id}
                    className="border-b last:border-0"
                  >
                    <td className="py-3 font-medium">
                      {medicine.name}
                    </td>

                    <td>
                      {medicine.batchNo}
                    </td>

                    <td>
                      {medicine.stock}
                    </td>

                    <td>
                      <span
                        className={
                          medicine.stock === 0
                            ? "font-semibold text-red-600"
                            : "font-semibold text-orange-600"
                        }
                      >
                        {medicine.stock === 0
                          ? "Out of stock"
                          : "Low stock"}
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