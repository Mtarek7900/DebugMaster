const makeOrders = (count) => Array.from({ length: count }, (_, i) => ({ id: 1001 + i, total: 20 + i }));
const ids = (result) => result.orders.map((order) => order.id);

check('every order appears on exactly one page', () => {
  const orders = makeOrders(25);
  const { totalPages } = paginate(orders, 1, 7);
  const seen = [];
  for (let page = 1; page <= totalPages; page++) {
    seen.push(...ids(paginate(orders, page, 7)));
  }
  expect(seen).toEqual(orders.map((order) => order.id));
});

check('pages of 1 show one order each', () => {
  expect(ids(paginate(makeOrders(5), 3, 1))).toEqual([1003]);
});

check('an exact multiple fills every page', () => {
  const result = paginate(makeOrders(20), 2, 10);
  expect(result.orders.length).toBe(10);
  expect(result.totalPages).toBe(2);
  expect(result.hasNext).toBe(false);
});

check('a page past the end shows the last page', () => {
  const result = paginate(makeOrders(25), 99);
  expect(result.page).toBe(3);
  expect(ids(result)).toEqual([1021, 1022, 1023, 1024, 1025]);
});

check('no orders gives one empty page', () => {
  const result = paginate([], 1);
  expect(result.orders).toEqual([]);
  expect(result.totalPages).toBe(1);
  expect(describePage(result, 0)).toBe('No orders yet');
});

check('the caption describes the orders on screen', () => {
  const orders = makeOrders(25);
  expect(describePage(paginate(orders, 2), 25)).toBe('Showing 11–20 of 25 orders');
});
