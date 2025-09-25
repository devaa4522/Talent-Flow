export function paginate(array, page=1, pageSize=10) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = array.slice(start, end);
  return { items, total: array.length, page, pageSize, totalPages: Math.ceil(array.length / pageSize) };
}

