export function getSort(query, allowedFields, defaultField) {
    const field = allowedFields.includes(query.sort)
        ? query.sort
        : defaultField;
    return {
        [field]: query.order === "asc" ? "asc" : "desc",
    };
}
//# sourceMappingURL=sort.js.map