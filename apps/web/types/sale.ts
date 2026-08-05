export interface Customer {
  id: string;
  name: string;
}

export interface Medicine {
  id: string;
  name: string;
}

export interface MedicineBatch {
  id: string;
  batchNo: string;
  remainingQuantity: number;
  expiryDate: string;

  medicine: Medicine;
}

export interface SaleItem {
  id: string;

  quantity: number;

  sellingPrice: string;

  subtotal: string;

  batch: MedicineBatch;
}

export interface Sale {
  id: string;

  invoiceNo: string;

  saleDate: string;

  totalAmount: string;

  paymentMethod: string;

  paymentStatus: string;

  customer: Customer | null;

  items: SaleItem[];
}

export interface SaleResponse {
  success: boolean;
  data: Sale[];
}

export interface CreateSaleItem {
  batchId: string;

  quantity: number;
}

export interface CreateSaleInput {
  invoiceNo: string;

  customerId?: string;

  items: CreateSaleItem[];
}