const candles = [{ name: 'Beeswax candle', price: 12, quantity: 2 }];

check('a shop on the defaults charges $4.99 shipping on a small order', () => {
  expect(checkoutSummary(candles, {})).toEqual({ subtotal: 24, shipping: 4.99, tax: 1.92, total: 30.91 });
});

check('a shop on the defaults ships free over $50', () => {
  const cart = [{ name: 'Candle gift set', price: 30, quantity: 2 }];
  expect(checkoutSummary(cart, {}).shipping).toBe(0);
});

check('a shop with its own $2.50 fee charges $2.50', () => {
  expect(checkoutSummary(candles, { shippingFee: 2.5 }).shipping).toBe(2.5);
});

check('Willow & Wax (shipping fee $0) charges no shipping', () => {
  expect(checkoutSummary(candles, { shippingFee: 0 })).toEqual({ subtotal: 24, shipping: 0, tax: 1.92, total: 25.92 });
});

check('Bluebird Books (tax rate 0) charges no tax', () => {
  const books = [{ name: 'Field guide to birds', price: 18, quantity: 1 }];
  expect(checkoutSummary(books, { taxRate: 0 })).toEqual({ subtotal: 18, shipping: 4.99, tax: 0, total: 22.99 });
});

check('buying more than the most allowed is refused', () => {
  const cart = [{ name: 'Tea light', price: 1, quantity: 11 }];
  expect(() => checkoutSummary(cart, {})).toThrow('at most 10');
});
