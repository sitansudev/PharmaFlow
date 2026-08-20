export function getPagination(query) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    return {
        page,
        limit,
        skip: (page - 1) * limit,
        take: limit,
    };
}
//# sourceMappingURL=pagination.js.map