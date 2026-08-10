import {
  Prisma,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";

import { saleRepository } from "./sale.repository.js";
import { CreateSaleDTO } from "./sale.validation.js";

import { AppError } from "../../shared/errors/app-error.js";

type SaleWithDetails = Prisma.SaleGetPayload<{
  include: {
    customer: true;
    items: {
      include: {
        batch: {
          include: {
            medicine: true;
          };
        };
      };
    };
  };
}>;

export class SaleService {
  async create(
    data: CreateSaleDTO
  ): Promise<SaleWithDetails> {
    return saleRepository.prisma.$transaction(async (tx) => {
      const existingSale = await tx.sale.findUnique({
        where: {
          invoiceNo: data.invoiceNo,
        },
      });

      if (existingSale) {
        throw new AppError(
          409,
          "Invoice already exists"
        );
      }

      if (data.customerId) {
        const customer = await tx.customer.findUnique({
          where: {
            id: data.customerId,
          },
        });

        if (!customer) {
          throw new AppError(
            404,
            "Customer not found"
          );
        }
      }

      let totalAmount = 0;

      const validatedItems: {
        batch: Prisma.MedicineBatchGetPayload<{
          include: {
            medicine: true;
          };
        }>;
        subtotal: number;
      }[] = [];
            for (const item of data.items) {
        const batch = await tx.medicineBatch.findUnique({
          where: {
            id: item.batchId,
          },
          include: {
            medicine: true,
          },
        });

        if (!batch) {
          throw new AppError(
            404,
            "Medicine batch not found"
          );
        }

        if (batch.remainingQuantity < item.quantity) {
          throw new AppError(
            400,
            `${batch.medicine.name} has only ${batch.remainingQuantity} units remaining`
          );
        }

        const subtotal =
          Number(batch.medicine.sellingPrice) *
          item.quantity;

        totalAmount += subtotal;

        validatedItems.push({
          batch,
          subtotal,
        });
      }

      const sale = await tx.sale.create({
        data: {
          invoiceNo: data.invoiceNo,

          customer: data.customerId
            ? {
                connect: {
                  id: data.customerId,
                },
              }
            : undefined,

          totalAmount,

          paymentMethod: data.paymentMethod as PaymentMethod,

          paymentStatus: PaymentStatus.PAID,

          paidAmount: totalAmount,

          balanceAmount: 0,

          discount: 0,

          tax: 0,
        },
      });
            for (let i = 0; i < data.items.length; i++) {
  const item = data.items[i];
  const { batch, subtotal } = validatedItems[i];

  const now = new Date();

  if (batch.expiryDate <= now) {
    throw new AppError(
      400,
      `${batch.medicine.name} batch ${batch.batchNo} has expired`
    );
  }

  const batchUpdate =
    await tx.medicineBatch.updateMany({
      where: {
        id: batch.id,
        isActive: true,
        remainingQuantity: {
          gte: item.quantity,
        },
      },
      data: {
        remainingQuantity: {
          decrement: item.quantity,
        },
      },
    });

  if (batchUpdate.count !== 1) {
    throw new AppError(
      400,
      `${batch.medicine.name} does not have enough stock in batch ${batch.batchNo}`
    );
  }

  const previousStock = batch.medicine.stock;

  const medicineUpdate =
    await tx.medicine.updateMany({
      where: {
        id: batch.medicineId,
        stock: {
          gte: item.quantity,
        },
      },
      data: {
        stock: {
          decrement: item.quantity,
        },
      },
    });

  if (medicineUpdate.count !== 1) {
    throw new AppError(
      400,
      `${batch.medicine.name} does not have enough total stock`
    );
  }

  await tx.saleItem.create({
    data: {
      saleId: sale.id,

      batchId: batch.id,

      quantity: item.quantity,

      costPrice: batch.purchasePrice,

      sellingPrice: batch.medicine.sellingPrice,

      subtotal,
    },
  });

  await tx.inventoryTransaction.create({
    data: {
      medicineId: batch.medicineId,

      batchId: batch.id,

      type: "SALE",

      quantity: item.quantity,

      previousStock,

      newStock: previousStock - item.quantity,

      referenceId: sale.id,

      notes: `Sale ${sale.invoiceNo}`,
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
              batch: {
                include: {
                  medicine: true,
                },
              },
            },
          },
        },
      });
    });
  }
    async getAll() {
    return saleRepository.prisma.sale.findMany({
      orderBy: {
        saleDate: "desc",
      },
      include: {
        customer: true,
        items: {
          include: {
            batch: {
              include: {
                medicine: true,
              },
            },
          },
        },
      },
    });
  }

  async getById(id: string) {
    const sale = await saleRepository.prisma.sale.findUnique({
      where: {
        id,
      },
      include: {
        customer: true,
        items: {
          include: {
            batch: {
              include: {
                medicine: true,
              },
            },
          },
        },
      },
    });

    if (!sale) {
      throw new AppError(404, "Sale not found");
    }

    return sale;
  }
}

export const saleService = new SaleService();