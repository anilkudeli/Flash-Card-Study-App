export function pagination(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 10));
  return { page, limit, skip: (page - 1) * limit };
}

export function pageResult(data, page, limit, total) {
  return { data, page, limit, total, pages: Math.ceil(total / limit) };
}
