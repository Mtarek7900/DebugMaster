// The order summary shown at checkout. Each shop can override the platform
// defaults in its settings; any setting a shop leaves out uses the default.

const PLATFORM_DEFAULTS = {
  shippingFee: 4.99,
  freeShippingOver: 50,
  taxRate: 0.08,
  maxQuantity: 10,
};

export function shopSetting(settings, name) {
  return settings[name] ?? PLATFORM_DEFAULTS[name];
}

export function checkoutSummary(cart, settings = {}) {
  const maxQuantity = shopSetting(settings, 'maxQuantity');
  for (const line of cart) {
    if (line.quantity > maxQuantity) {
      throw new RangeError(`You can buy at most ${maxQuantity} of ${line.name}`);
    }
  }

  const subtotal = toCents(cart.reduce((sum, line) => sum + line.price * line.quantity, 0));

  let shipping = 0;
  if (cart.length > 0 && subtotal < shopSetting(settings, 'freeShippingOver')) {
    shipping = shopSetting(settings, 'shippingFee');
  }

  const tax = toCents(subtotal * shopSetting(settings, 'taxRate'));

  return { subtotal, shipping, tax, total: toCents(subtotal + shipping + tax) };
}

function toCents(amount) {
  return Math.round(amount * 100) / 100;
}
