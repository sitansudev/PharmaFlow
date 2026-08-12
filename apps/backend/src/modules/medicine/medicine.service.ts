import {
  Prisma,
  Medicine,
} from "@prisma/client";

import { prisma } from "../../database/prisma.js";
import type { MedicineQuery } from "./medicine.query.js";

import { medicineRepository } from "./medicine.repository.js";

import {
  CreateMedicineDTO,
  UpdateMedicineDTO,
} from "./medicine.validation.js";

import { AppError } from "../../shared/errors/app-error.js";

export class MedicineService {
  async create(
    data: CreateMedicineDTO
  ): Promise<Medicine> {
    const existingMedicines =
      await prisma.medicine.findMany({
        where: {
          name: {
            equals: data.name.trim(),
            mode: "insensitive",
          },
        },

        select: {
          id: true,
          name: true,
          genericName: true,
        },
      });

    const normalizedGeneric =
      data.genericName?.trim().toLowerCase() ?? "";

    const duplicate =
      existingMedicines.find((medicine) => {
        const existingGeneric =
          medicine.genericName
            ?.trim()
            .toLowerCase() ?? "";

        return (
          existingGeneric ===
          normalizedGeneric
        );
      });

    if (duplicate) {
      throw new AppError(
        409,
        `Medicine "${duplicate.name}" already exists. Select the existing medicine and add the new purchase instead.`
      );
    }

    return prisma.$transaction(
      async (tx) => {
        /*
         * Create medicine.
         *
         * Pricing architecture:
         *
         * rate = purchase rate
         * mrp = selling / maximum retail price
         *
         * MRP belongs to MedicineBatch because
         * different batches can have different MRPs.
         */
        const medicine =
          await tx.medicine.create({
            data: {
              name: data.name,
              genericName:
                data.genericName,

              stock:
                data.stock +
                data.bonus,

              minimumStock:
                data.minimumStock,

              unit:
                data.unit,

              barcode:
                data.barcode,

              latestSupplierId:
                data.supplierId,

              latestBatchNo:
                data.batchNo,

              latestRate:
                data.rate,

              latestExpiryDate:
                data.expiryDate,

              category:
                data.categoryId
                  ? {
                      connect: {
                        id: data.categoryId,
                      },
                    }
                  : undefined,
            },
          });

        /*
         * Create initial batch.
         */
        const receivedQuantity =
          data.stock +
          data.bonus;

        await tx.medicineBatch.create({
          data: {
            medicineId:
              medicine.id,

            supplierId:
              data.supplierId,

            batchNo:
              data.batchNo,

            pack:
              data.pack,

            bonus:
              data.bonus,

            rate:
              data.rate,

            discount:
              data.discount,

            mrp:
              data.mrp,

            quantity:
              receivedQuantity,

            remainingQuantity:
              receivedQuantity,

            expiryDate:
              data.expiryDate,

            rackLocation:
              data.rackLocation,

            isActive:
              true,
          },
        });

        /*
         * Record initial inventory.
         */
        await tx.inventoryTransaction.create({
          data: {
            medicineId:
              medicine.id,

            type:
              "PURCHASE",

            quantity:
              receivedQuantity,

            previousStock:
              0,

            newStock:
              receivedQuantity,

            notes:
              "Initial stock while creating medicine",
          },
        });

        return medicine;
      }
    );
  }

  async findAll(
    query: MedicineQuery
  ) {
    return medicineRepository.findAll(
      query
    );
  }

  async findById(
    id: string
  ): Promise<Medicine> {
    const medicine =
      await medicineRepository.findById(
        id
      );

    if (!medicine) {
      throw new AppError(
        404,
        "Medicine not found"
      );
    }

    return medicine;
  }

  async findGroupedById(
    id: string
  ) {
    const medicine =
      await medicineRepository.findById(
        id
      );

    if (!medicine) {
      throw new AppError(
        404,
        "Medicine not found"
      );
    }

    const normalizedName =
      medicine.name.trim();

    const normalizedGeneric =
      medicine.genericName?.trim() ??
      null;

    const medicines =
      await prisma.medicine.findMany({
        where: {
          name: {
            equals:
              normalizedName,
            mode: "insensitive",
          },

          ...(normalizedGeneric
            ? {
                genericName: {
                  equals:
                    normalizedGeneric,
                  mode: "insensitive",
                },
              }
            : {
                genericName:
                  null,
              }),
        },

        include: {
          category: true,

          batches: {
            include: {
              supplier: true,
            },

            orderBy: {
              expiryDate:
                "asc",
            },
          },
        },

        orderBy: {
          unit: "asc",
        },
      });

    return {
      name:
        medicine.name,

      genericName:
        medicine.genericName,

      category:
        medicine.category,

      medicines,

      totalStock:
        medicines.reduce(
          (
            total,
            item
          ) =>
            total +
            item.stock,
          0
        ),

      totalBatches:
        medicines.reduce(
          (
            total,
            item
          ) =>
            total +
            item.batches
              .length,
          0
        ),

      totalSuppliers:
        new Set(
          medicines.flatMap(
            (item) =>
              item.batches.map(
                (batch) =>
                  batch.supplierId
              )
          )
        ).size,
    };
  }

  async update(
    id: string,
    data: UpdateMedicineDTO
  ): Promise<Medicine> {
    const existingMedicine =
      await prisma.medicine.findUnique({
        where: {
          id,
        },

        include: {
          batches: {
            orderBy: {
              expiryDate:
                "asc",
            },
          },
        },
      });

    if (!existingMedicine) {
      throw new AppError(
        404,
        "Medicine not found"
      );
    }

    return prisma.$transaction(
      async (tx) => {
        /*
         * Medicine-level fields.
         *
         * IMPORTANT:
         * There is no sellingPrice anymore.
         * MRP belongs to the batch.
         */
        const updateData:
          Prisma.MedicineUpdateInput =
            {};

        if (
          data.name !==
          undefined
        ) {
          updateData.name =
            data.name;
        }

        if (
          data.genericName !==
          undefined
        ) {
          updateData.genericName =
            data.genericName;
        }

        if (
          data.unit !==
          undefined
        ) {
          updateData.unit =
            data.unit;
        }

        if (
          data.barcode !==
          undefined
        ) {
          updateData.barcode =
            data.barcode;
        }

        if (
          data.minimumStock !==
          undefined
        ) {
          updateData.minimumStock =
            data.minimumStock;
        }

        /*
         * Category.
         */
        if (
          data.categoryId !==
          undefined
        ) {
          updateData.category =
            data.categoryId
              ? {
                  connect: {
                    id:
                      data.categoryId,
                  },
                }
              : {
                  disconnect:
                    true,
                };
        }

        /*
         * Medicine-level stock.
         */
        if (
          data.stock !==
          undefined
        ) {
          updateData.stock =
            data.stock;
        }

        /*
         * Keep latestRate synchronized
         * when the rate is changed.
         */
        if (
          data.rate !==
          undefined
        ) {
          updateData.latestRate =
            data.rate;
        }

        /*
         * Update medicine.
         */
        const medicine =
          await tx.medicine.update({
            where: {
              id,
            },

            data:
              updateData,
          });

        /*
         * Commercial information belongs
         * to the current/latest batch.
         */
        const latestBatch =
          existingMedicine
            .batches?.[0];

        if (latestBatch) {
          const batchUpdateData:
            Prisma.MedicineBatchUpdateInput =
              {};

          /*
           * Supplier.
           */
          if (
            data.supplierId !==
            undefined
          ) {
            batchUpdateData.supplier =
              {
                connect: {
                  id:
                    data.supplierId,
                },
              };
          }

          /*
           * Batch number.
           */
          if (
            data.batchNo !==
            undefined
          ) {
            batchUpdateData.batchNo =
              data.batchNo;
          }

          /*
           * Pack.
           */
          if (
            data.pack !==
            undefined
          ) {
            batchUpdateData.pack =
              data.pack;
          }

          /*
           * Bonus.
           */
          if (
            data.bonus !==
            undefined
          ) {
            batchUpdateData.bonus =
              data.bonus;
          }

          /*
           * Purchase rate.
           */
          if (
            data.rate !==
            undefined
          ) {
            batchUpdateData.rate =
              data.rate;
          }

          /*
           * Purchase discount.
           */
          if (
            data.discount !==
            undefined
          ) {
            batchUpdateData.discount =
              data.discount;
          }

          /*
           * MRP.
           *
           * MRP is now the only
           * selling price field.
           */
          if (
            data.mrp !==
            undefined
          ) {
            batchUpdateData.mrp =
              data.mrp;
          }

          /*
           * Expiry.
           */
          if (
            data.expiryDate !==
            undefined
          ) {
            batchUpdateData.expiryDate =
              data.expiryDate;
          }

          /*
           * Rack.
           */
          if (
            data.rackLocation !==
            undefined
          ) {
            batchUpdateData.rackLocation =
              data.rackLocation;
          }

          /*
           * Update batch commercial data.
           */
          if (
            Object.keys(
              batchUpdateData
            ).length > 0
          ) {
            await tx.medicineBatch.update(
              {
                where: {
                  id:
                    latestBatch.id,
                },

                data:
                  batchUpdateData,
              }
            );
          }

          /*
           * If stock is manually changed,
           * update remainingQuantity.
           *
           * We do NOT change quantity because
           * quantity represents total received
           * stock.
           */
          if (
            data.stock !==
            undefined
          ) {
            await tx.medicineBatch.update(
              {
                where: {
                  id:
                    latestBatch.id,
                },

                data: {
                  remainingQuantity:
                    data.stock,
                },
              }
            );
          }
        }

        /*
         * Keep latest summary fields synchronized.
         */
        const latestRate =
          data.rate ??
          medicine.latestRate;

        const latestSupplierId =
          data.supplierId ??
          medicine.latestSupplierId;

        const latestBatchNo =
          data.batchNo ??
          medicine.latestBatchNo;

        const latestExpiryDate =
          data.expiryDate ??
          medicine.latestExpiryDate;

        /*
         * Only update summary fields when
         * something actually changed.
         */
        if (
          data.rate !==
            undefined ||
          data.supplierId !==
            undefined ||
          data.batchNo !==
            undefined ||
          data.expiryDate !==
            undefined
        ) {
          return tx.medicine.update({
            where: {
              id,
            },

            data: {
              latestRate:
                latestRate,

              latestSupplierId:
                latestSupplierId,

              latestBatchNo:
                latestBatchNo,

              latestExpiryDate:
                latestExpiryDate,
            },
          });
        }

        return medicine;
      }
    );
  }
    async delete(
    id: string
  ): Promise<void> {
    const medicine =
      await prisma.medicine.findUnique({
        where: {
          id,
        },
      });

    if (!medicine) {
      throw new AppError(
        404,
        "Medicine not found"
      );
    }

    await prisma.medicine.delete({
      where: {
        id,
      },
    });
  }
}

export const medicineService =
  new MedicineService();