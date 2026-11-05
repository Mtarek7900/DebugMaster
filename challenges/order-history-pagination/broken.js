// Splits a customer's order history into pages for the "My Orders" screen.
// Pages are numbered from 1, the same way they are shown in the UI.

const DEFAULT_PAGE_SIZE = 10;

export function paginate(orders, page, pageSize = DEFAULT_PAGE_SIZE) {
  if (!Array.isArray(orders)) {
    throw new TypeError('orders must be an array');
  }
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError('pageSize must be a positive whole number');
  }

  const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));
  const current = clamp(Math.trunc(page) || 1, 1, totalPages);

  const start = (current - 1) * pageSize;
  const end = start + pageSize - 1;

  return {
    orders: orders.slice(start, end),
    page: current,
    pageSize,
    totalPages,
    hasPrevious: current > 1,
    hasNext: current < totalPages,
  };
}

// The caption under the list, e.g. "Showing 11–20 of 25 orders".
export function describePage(result, totalOrders) {
  if (totalOrders === 0) {
    return 'No orders yet';
  }
  const first = (result.page - 1) * result.pageSize + 1;
  const last = first + result.orders.length - 1;
  return `Showing ${first}–${last} of ${totalOrders} orders`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
