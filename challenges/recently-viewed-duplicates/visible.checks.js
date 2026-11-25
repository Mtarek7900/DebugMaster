// A pretend server. Like the real one, it sends a fresh copy of the product each time.
const CATALOG = {
  1: { id: 1, name: 'Desk lamp', price: 39 },
  2: { id: 2, name: 'Office chair', price: 149 },
  3: { id: 3, name: 'Monitor stand', price: 45 },
};
const loadProduct = (id) => JSON.parse(JSON.stringify(CATALOG[id]));

check('products show newest first', () => {
  const strip = createRecentlyViewed();
  strip.opened(loadProduct(1));
  strip.opened(loadProduct(2));
  strip.opened(loadProduct(3));
  expect(strip.names()).toEqual(['Monitor stand', 'Office chair', 'Desk lamp']);
});

check('clicking a product in the strip moves it to the front', () => {
  const strip = createRecentlyViewed();
  const lamp = loadProduct(1);
  strip.opened(lamp);
  strip.opened(loadProduct(2));
  strip.opened(lamp);
  expect(strip.names()).toEqual(['Desk lamp', 'Office chair']);
});

check('going back to a product from search shows it once, at the front', () => {
  const strip = createRecentlyViewed();
  strip.opened(loadProduct(1));
  strip.opened(loadProduct(2));
  strip.opened(loadProduct(1));
  expect(strip.names()).toEqual(['Desk lamp', 'Office chair']);
});

check('the x takes a product out of the strip', () => {
  const strip = createRecentlyViewed();
  strip.opened(loadProduct(1));
  strip.opened(loadProduct(2));
  strip.remove(1);
  expect(strip.names()).toEqual(['Office chair']);
});
