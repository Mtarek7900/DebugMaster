const CATALOG = {
  1: { id: 1, name: 'Desk lamp', price: 39 },
  2: { id: 2, name: 'Office chair', price: 149 },
  3: { id: 3, name: 'Monitor stand', price: 45 },
  4: { id: 4, name: 'Keyboard', price: 79 },
  5: { id: 5, name: 'Mouse', price: 25 },
  6: { id: 6, name: 'Webcam', price: 59 },
  7: { id: 7, name: 'Desk lamp', price: 24 },
};
const loadProduct = (id) => JSON.parse(JSON.stringify(CATALOG[id]));

check('flipping between two products keeps the rest of the strip', () => {
  const strip = createRecentlyViewed();
  [3, 4, 5, 1, 2, 1, 2, 1, 2].forEach((id) => strip.opened(loadProduct(id)));
  expect(strip.names()).toEqual(['Office chair', 'Desk lamp', 'Mouse', 'Keyboard', 'Monitor stand']);
});

check('the strip holds at most 5 products', () => {
  const strip = createRecentlyViewed();
  [1, 2, 3, 4, 5, 6].forEach((id) => strip.opened(loadProduct(id)));
  expect(strip.names()).toEqual(['Webcam', 'Mouse', 'Keyboard', 'Monitor stand', 'Office chair']);
});

check('reopening a product shows its latest price', () => {
  const strip = createRecentlyViewed();
  strip.opened(loadProduct(2));
  strip.opened(loadProduct(1));
  strip.opened({ ...loadProduct(2), price: 119 });
  expect(strip.prices()).toEqual([119, 39]);
});

check('two different products with the same name both show', () => {
  const strip = createRecentlyViewed();
  strip.opened(loadProduct(1));
  strip.opened(loadProduct(7));
  expect(strip.prices()).toEqual([24, 39]);
});

check('removing a reopened product leaves no copy behind', () => {
  const strip = createRecentlyViewed();
  strip.opened(loadProduct(1));
  strip.opened(loadProduct(2));
  strip.opened(loadProduct(1));
  strip.remove(1);
  expect(strip.names()).toEqual(['Office chair']);
});
