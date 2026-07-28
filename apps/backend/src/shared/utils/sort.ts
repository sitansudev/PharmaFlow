import type { ListQuery } from "../../types/query.js";

export function getSort<T extends string>(
  query: ListQuery,
  allowedFields: readonly T[],
  defaultField: T
): Record<T, "asc" | "desc"> {
  const field = allowedFields.includes(query.sort as T)
    ? (query.sort as T)
    : defaultField;

  return {
    [field]: query.order === "asc" ? "asc" : "desc",
  } as Record<T, "asc" | "desc">;
}