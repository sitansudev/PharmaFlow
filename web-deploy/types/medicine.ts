export interface Category {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
}

export interface MedicineBatch {
  id: string;

  batchNo: string;
  pack: string;

  bonus: number;

  rate: string;
  discount: string;
  mrp: string;

  quantity: number;
  remainingQuantity: number;

  expiryDate: string;

  rackLocation: string | null;

  supplier: Supplier;
}

export interface Medicine {
  id: string;

  name: string;
  genericName: string | null;

  stock: number;
  minimumStock: number;


  barcode: string | null;

  category: Category | null;

  batches: MedicineBatch[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MedicineResponse {
  success: boolean;
  data: Medicine[];
  meta: PaginationMeta;
}

export interface CreateMedicine {
  name: string;
  genericName?: string;

  supplierId: string;
  categoryId?: string;

  batchNo: string;
  pack: string;

  bonus: number;

  rate: number;
  discount: number;
  mrp: number;

  stock: number;
  minimumStock: number;

  expiryDate: string;

  rackLocation?: string;
  barcode?: string;
}

export type UpdateMedicine =
  Partial<CreateMedicine>;