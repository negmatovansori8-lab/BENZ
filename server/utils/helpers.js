export function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(48, Math.max(1, parseInt(query.limit, 10) || 12));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function paginate({ rows, total, page, limit }) {
  return {
    data: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export function sanitizeString(value, max = 2000) {
  if (value == null) return value;
  return String(value)
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, max);
}
