export interface Supplier {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  companyName?: string | null;
  address?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierResponse {
  success: boolean;
  data: Supplier[];
}