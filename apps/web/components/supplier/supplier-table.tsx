"use client";

import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import type { Supplier } from "@/types/supplier";

import { useDeleteSupplier } from "@/hooks/use-delete-supplier";

import { Button } from "@/components/ui/button";
import { SupplierLedgerDialog } from "./supplier-ledger-dialog";
import { EditSupplierDialog } from "./edit-supplier-dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SupplierTableProps {
  suppliers: Supplier[];
}

export function SupplierTable({
  suppliers,
}: SupplierTableProps) {
  const deleteSupplier = useDeleteSupplier();

  async function handleDelete(supplier: Supplier) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${supplier.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteSupplier.mutateAsync(
        supplier.id
      );

      toast.success(
        "Supplier deleted successfully"
      );
    } catch (error) {
      console.error(
        "DELETE SUPPLIER ERROR:",
        error
      );

      toast.error(
        "Failed to delete supplier"
      );
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              Supplier Name
            </TableHead>

            <TableHead>
              Phone
            </TableHead>

            <TableHead>
              Email
            </TableHead>

            <TableHead>
              PAN No.
            </TableHead>

            <TableHead>
              Address
            </TableHead>

            <TableHead className="text-center">
              Ledger
            </TableHead>

            <TableHead className="text-center">
              Edit
            </TableHead>

            <TableHead className="text-center">
              Delete
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {suppliers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="h-24 text-center text-muted-foreground"
              >
                No suppliers found.
              </TableCell>
            </TableRow>
          ) : (
            suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                {/* Supplier Name */}

                <TableCell className="font-medium">
                  {supplier.name}
                </TableCell>

                {/* Phone */}

                <TableCell>
                  {supplier.phone}
                </TableCell>

                {/* Email */}

                <TableCell>
                  {supplier.email ?? "-"}
                </TableCell>

                {/* PAN */}

                <TableCell>
                  {supplier.panNo ?? "-"}
                </TableCell>

                {/* Address */}

                <TableCell>
                  {supplier.address ?? "-"}
                </TableCell>

                {/* Ledger */}

                <TableCell className="text-center">
                  <SupplierLedgerDialog
                    supplier={supplier}
                  />
                </TableCell>

                {/* Edit */}

                <TableCell className="text-center">
                  <EditSupplierDialog
                    supplier={supplier}
                  />
                </TableCell>

                {/* Delete */}

                <TableCell className="text-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={
                      deleteSupplier.isPending
                    }
                    onClick={() =>
                      handleDelete(supplier)
                    }
                    title="Delete supplier"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}