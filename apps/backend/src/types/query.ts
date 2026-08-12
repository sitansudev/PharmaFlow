export interface ListQuery {
  page?: number;
  limit?: number;

  search?: string;

  sort?:
  | "name"
  | "genericName"
  | "brand"
  | "stock"
  | "createdAt";

  order?: "asc" | "desc";

  categoryId?: string;

  lowStock?: boolean;
  inStock?: boolean;
  expired?: boolean;
}