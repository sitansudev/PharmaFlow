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

  rate: string;
  mrp: string;

  medicine: Medicine;
}

export interface SaleItem {
  id: string;

  quantity: number;

  mrp: string;

  subtotal: string;

  batch: MedicineBatch;
}

export interface Sale {
  id: string;

  invoiceNo: string;

  saleDate: string;

  /*
   * Final amount after discount.
   */
  totalAmount: string;

  /*
   * Actual discount in currency.
   */
  discount: string;

  /*
   * Discount percentage entered by user.
   */
  discountPercent: string;

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

export type PaymentMethod =
  | "CASH"
  | "ESEWA"
  | "FONEPAY";

export interface CreateSaleInput {
  invoiceNo: string;

  customerId?: string;

  paymentMethod: PaymentMethod;

  discountPercent?: number;

  items: CreateSaleItem[];
}