export interface Supplier {
  id: string;
  name: string;
}

export interface Medicine {
  id: string;
  name: string;
}

export interface PurchaseItem {
  id: string;

  quantity: number;

  purchasePrice: string;

  subtotal: string;

  batch: {
    id: string;
    batchNo: string;
    expiryDate: string;
  };

  medicine: Medicine;
}

export interface Purchase {
  id: string;

  invoiceNo: string;

  purchaseDate: string;

  totalAmount: string;

  supplier: Supplier;

  items: PurchaseItem[];
}

export interface PurchaseResponse {
  success: boolean;
  data: Purchase[];
}

export interface CreatePurchaseItem {
  medicineId: string;

  quantity: number;

  purchasePrice: number;

  batchNo: string;

  expiryDate: string;

  manufacturingDate?: string;

  rackLocation?: string;
}

export interface CreatePurchase {
  invoiceNo: string;

  supplierId: string;

  purchaseDate?: string;

  items: CreatePurchaseItem[];
}