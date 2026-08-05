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

  purchasePrice: string;

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

  sellingPrice: string;

  stock: number;

  minimumStock: number;

  unit: string;

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