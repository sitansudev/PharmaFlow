export interface Supplier {
  id: string;
  name: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName?: string | null;
}

export interface PurchaseItem {
  id: string;

  quantity: number;

  rate: string;

  subtotal: string;

  batch: {
    id: string;
    batchNo: string;
    pack: string;

    bonus: number;

    rate: string;
    discount: string;
    mrp: string;

    expiryDate: string;
    rackLocation?: string | null;
  };

  medicine: Medicine;
}

export interface Purchase {
  id: string;

  invoiceNo: string;

  uniqueNumber?: string | null;

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

  pack: string;

  quantity: number;

  bonus: number;

  rate: number;

  discount: number;

  mrp: number;

  batchNo: string;

  expiryDate: string;

  rackLocation?: string;
}

export interface CreatePurchase {
  invoiceNo: string;

  uniqueNumber?: string;

  supplierId: string;

  purchaseDate?: string;

  items: CreatePurchaseItem[];
}