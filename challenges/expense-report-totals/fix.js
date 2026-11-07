// Totals for the "New expense report" form. Amounts arrive exactly as the
// employee typed them, e.g. "$1,200.50", "45" or "-$15.00" for a refund.

export function parseAmount(raw) {
  if (typeof raw === 'number') {
    return raw;
  }
  const cleaned = String(raw).replace(/[$,\s]/g, '');
  if (cleaned === '' || isNaN(cleaned)) {
    throw new Error(`"${raw}" is not an amount`);
  }
  return Number(cleaned);
}

export function reportTotals(expenses) {
  let total = 0;
  const byCategory = {};

  for (const expense of expenses) {
    const amount = parseAmount(expense.amount);
    total += amount;
    byCategory[expense.category] = (byCategory[expense.category] ?? 0) + amount;
  }

  const rounded = {};
  for (const [category, sum] of Object.entries(byCategory)) {
    rounded[category] = roundCents(sum);
  }

  return { total: roundCents(total), byCategory: rounded, count: expenses.length };
}

// For the summary line, e.g. "$1,300.00" or "-$15.00".
export function formatAmount(amount) {
  const sign = amount < 0 ? '-' : '';
  const digits = Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}$${digits}`;
}

function roundCents(value) {
  return Math.round(value * 100) / 100;
}
