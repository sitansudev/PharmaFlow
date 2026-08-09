"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import type { Customer } from "@/types/customer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDeleteCustomer } from "@/hooks/use-delete-customer";
import { RecordPaymentDialog } from "./record-payment-dialog";
interface Props {
  customers: Customer[];
}

export function CustomerTable({
  customers,
}: Props) {
  const [search, setSearch] = useState("");

  const deleteCustomer = useDeleteCustomer();

  const filteredCustomers = customers.filter(
    (customer) => {
      const query = search
        .toLowerCase()
        .trim();

      if (!query) return true;

      return (
        customer.name
          .toLowerCase()
          .includes(query) ||
        customer.phone
          ?.toLowerCase()
          .includes(query) ||
        customer.email
          ?.toLowerCase()
          .includes(query)
      );
    }
  );

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Delete this customer?"
    );

    if (!confirmed) return;

    try {
      await deleteCustomer.mutateAsync(id);
    } catch {
      // Error notification is handled by the mutation.
    }
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search customers by name, phone or email..."
        value={search}
        onChange={(event) =>
          setSearch(event.target.value)
        }
      />

      {filteredCustomers.length === 0 ? (
        <div className="rounded-xl border bg-white py-16 text-center">
          <h3 className="text-lg font-semibold">
            No customers found
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            {search
              ? "Try a different search."
              : "Add your first customer."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left">
                  Name
                </th>
                <th className="px-5 py-3 text-left">
                  Phone
                </th>
                <th className="px-5 py-3 text-left">
                  Email
                </th>
                <th className="px-5 py-3 text-left">
                  Address
                </th>
                <th className="px-5 py-3 text-right">
                    Due Amount
                </th>
                <th className="px-5 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map(
                (customer) => (
                  <tr
                    key={customer.id}
                    className="border-b last:border-0"
                  >
                    <td className="px-5 py-4 font-medium">
                      {customer.name}
                    </td>

                    <td className="px-5 py-4">
                      {customer.phone ?? "-"}
                    </td>

                    <td className="px-5 py-4">
                      {customer.email ?? "-"}
                    </td>

                    <td className="px-5 py-4">
                      {customer.address ?? "-"}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold">
                        Rs. {Number(customer.dueAmount).toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                     <RecordPaymentDialog
                      customer={customer}
                    />

                     <Button
                     variant="destructive"
                    size="icon"
                    onClick={() =>
                    handleDelete(customer.id)
      }
      disabled={
        deleteCustomer.isPending
      }
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}