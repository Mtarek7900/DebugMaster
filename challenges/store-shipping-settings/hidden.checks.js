const mugs = [{ name: 'Stoneware mug', price: 15, quantity: 2 }];

check('a free-shipping threshold of 0 ships every order free', () => {
  expect(checkoutSummary(mugs, { freeShippingOver: 0 }).shipping).toBe(0);
});

check('free shipping and no tax together', () => {
  expect(checkoutSummary(mugs, { shippingFee: 0, taxRate: 0 })).toEqual({ subtotal: 30, shipping: 0, tax: 0, total: 30 });
});

check('a shop that sets one value keeps the defaults for the rest', () => {
  expect(checkoutSummary(mugs, { taxRate: 0.05 })).toEqual({ subtotal: 30, shipping: 4.99, tax: 1.5, total: 36.49 });
});

check('a setting left undefined uses the default', () => {
  expect(checkoutSummary(mugs, { shippingFee: undefined }).shipping).toBe(4.99);
});

check('a shop limit of 3 refuses 4 of one item', () => {
  const cart = [{ name: 'Stoneware mug', price: 15, quantity: 4 }];
  expect(() => checkoutSummary(cart, { maxQuantity: 3 })).toThrow('at most 3');
});

check('an empty cart costs nothing, even with a custom fee', () => {
  expect(checkoutSummary([], { shippingFee: 6 })).toEqual({ subtotal: 0, shipping: 0, tax: 0, total: 0 });
});

check('the settings lookup keeps a shop value of 0', () => {
  expect(shopSetting({ shippingFee: 0 }, 'shippingFee')).toBe(0);
  expect(shopSetting({}, 'shippingFee')).toBe(4.99);
});
