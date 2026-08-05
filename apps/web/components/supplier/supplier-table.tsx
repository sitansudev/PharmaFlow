"use client";

import type { Supplier } from "@/types/supplier";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { EditSupplierDialog } from "./edit-supplier-dialog";

import { useDeleteSupplier } from "@/hooks/use-delete-supplier";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  suppliers: Supplier[];
}

export function SupplierTable({
  suppliers,
}: Props) {
  const deleteSupplier = useDeleteSupplier();

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Delete this supplier?"
    );

    if (!confirmed) return;

    await deleteSupplier.mutateAsync(id);
  }

  if (suppliers.length === 0) {
    return (
      <div className="rounded-xl border bg-white py-16 text-center">
        <h3 className="text-lg font-semibold">
          No suppliers found
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          Add your first supplier.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell className="font-medium">
                {supplier.name}
              </TableCell>

              <TableCell>
                {supplier.companyName ?? "-"}
              </TableCell>

              <TableCell>
                {supplier.phone}
              </TableCell>

              <TableCell>
                {supplier.email ?? "-"}
              </TableCell>

              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <EditSupplierDialog
                    supplier={supplier}
                  />

                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() =>
                      handleDelete(supplier.id)
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}