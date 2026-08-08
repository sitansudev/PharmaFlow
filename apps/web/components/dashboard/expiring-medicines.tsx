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
    <Card>
      <CardHeader>
        <CardTitle>
               🚨 Near Expiry Medicines
        </CardTitle>
      </CardHeader>

      <CardContent>
        {medicines.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No medicines are nearing expiry.
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
                    Expiry Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {medicines.map((medicine) => (
                  <tr
                    key={medicine.id}
                    className="border-b"
                  >
                    <td className="py-3">
                      {medicine.name}
                    </td>

                    <td>{medicine.batchNo}</td>

                    <td>{medicine.stock}</td>

                    <td>
                      {new Date(
                        medicine.expiryDate
                      ).toLocaleDateString()}
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