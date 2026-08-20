"use client";

import { AddCustomerDialog } from "@/components/customer/add-customer-dialog";
import { CustomerTable } from "@/components/customer/customer-table";

import { useCustomers } from "@/hooks/use-customers";

export default function CustomersPage() {
  const {
    data,
    isLoading,
    isError,
  } = useCustomers();

  if (isLoading) {
    return (
      <div className="p-8">
        Loading customers...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-red-500">
        Failed to load customers.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Customers
          </h1>

          <p className="text-muted-foreground">
            Manage pharmacy customers.
          </p>
        </div>

        <AddCustomerDialog />
      </div>

      <CustomerTable
        customers={data.data}
      />
    </div>
  );
}