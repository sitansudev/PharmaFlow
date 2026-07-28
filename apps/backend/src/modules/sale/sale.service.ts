import { Prisma } from "@prisma/client";

import { saleRepository } from "./sale.repository.js";
import { CreateSaleDTO } from "./sale.validation.js";

import { AppError } from "../../shared/errors/app-error.js";
type SaleWithDetails = Prisma.SaleGetPayload<{
  include: {
    customer: true;
    items: {
      include: {
        medicine: true;
      };
    };
  };
}>;
export class SaleService {
  async create(
  data: CreateSaleDTO
): Promise<SaleWithDetails> {
  return saleRepository.prisma.$transaction(async (tx) => {

    // Check duplicate invoice number
    const existingSale = await tx.sale.findUnique({
      where: {
        invoiceNo: data.invoiceNo,
      },
    });

    if (existingSale) {
      throw new AppError(409, "Invoice number already exists");
    }

    // Validate customer
    if (data.customerId) {
      const customer = await tx.customer.findUnique({
        where: {
          id: data.customerId,
        },
      });

      if (!customer) {
        throw new AppError(404, "Customer not found");
      }
    }

    let totalAmount = 0;

    // Continue with medicine validation...

      for (const item of data.items) {
        const medicine = await tx.medicine.findUnique({
          where: {
            id: item.medicineId,
          },
        });

        if (!medicine) {
          throw new AppError(404, "Medicine not found");
        }

        if (medicine.stock < item.quantity) {
          throw new AppError(
            400,
            `${medicine.name} has only ${medicine.stock} units in stock`
          );
        }

        totalAmount += item.quantity * Number(medicine.sellingPrice);
      }

      const sale = await tx.sale.create({
        data: {
          invoiceNo: data.invoiceNo,
          customerId: data.customerId,
          totalAmount,
        },
      });

      for (const item of data.items) {
        const medicine = await tx.medicine.findUnique({
  where: {
    id: item.medicineId,
  },
});

if (!medicine) {
  throw new AppError(404, "Medicine not found");
}

await tx.saleItem.create({
  data: {
    saleId: sale.id,
    medicineId: item.medicineId,
    quantity: item.quantity,
    sellingPrice: medicine.sellingPrice,
    subtotal: Number(medicine.sellingPrice) * item.quantity,
  },
});

        await tx.medicine.update({
          where: {
            id: item.medicineId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

     return tx.sale.findUniqueOrThrow({
  where: {
    id: sale.id,
  },
  include: {
    customer: true,
    items: {
      include: {
        medicine: true,
      },
    },
  },
});
    });
  }
}

export const saleService = new SaleService();
