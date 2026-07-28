export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function paginatedResponse<T>(
  data: T,
  meta: Meta,
) {
  return {
    success: true,
    data,
    meta,
  };
}