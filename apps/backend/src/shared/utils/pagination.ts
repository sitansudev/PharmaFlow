export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export function getPagination(query: PaginationQuery): PaginationResult {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 2000, 1), 2000);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}
