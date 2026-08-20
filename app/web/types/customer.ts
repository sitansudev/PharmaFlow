export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  dueAmount: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerResponse {
  success: boolean;
  data: Customer[];
}

export interface SingleCustomerResponse {
  success: boolean;
  data: Customer;
}

export interface CreateCustomerInput {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  dueAmount?: string;
}

export type UpdateCustomerInput =
  Partial<CreateCustomerInput>;
