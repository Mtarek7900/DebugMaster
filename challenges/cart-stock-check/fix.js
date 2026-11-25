// Runs just before checkout: brings the cart in line with what's in stock.
// Sold-out items are taken out, and quantities are lowered to what's left.
// The cart is updated in place because the cart screen holds on to it.

export function applyStock(cart, stock) {
  const removed = [];
  const lowered = [];

  for (let i = 0; i < cart.items.length; i++) {
    const item = cart.items[i];
    const available = stock[item.sku] ?? 0;

    if (available === 0) {
      removed.push(item.name);
      cart.items.splice(i, 1);
      i--;
    } else if (item.quantity > available) {
      item.quantity = available;
      lowered.push(item.name);
    }
  }

  return { removed, lowered };
}

// The note shown above the cart, e.g. "Removed: Scarf. Fewer left: Hat."
export function stockNote({ removed, lowered }) {
  const parts = [];
  if (removed.length) parts.push(`Removed: ${removed.join(', ')}.`);
  if (lowered.length) parts.push(`Fewer left: ${lowered.join(', ')}.`);
  return parts.join(' ');
}
