// 25 orders, numbered #1001 to #1025, oldest first.
const orders = Array.from({ length: 25 }, (_, i) => ({ id: 1001 + i, total: 20 + i }));
const ids = (result) => result.orders.map((order) => order.id);

check('page 1 shows the first 10 orders', () => {
  expect(ids(paginate(orders, 1))).toEqual([1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010]);
});

check('page 2 shows orders #1011 to #1020', () => {
  expect(ids(paginate(orders, 2))).toEqual([1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 1020]);
});

check('the last page shows the remaining 5 orders', () => {
  expect(ids(paginate(orders, 3))).toEqual([1021, 1022, 1023, 1024, 1025]);
});

check('25 orders make 3 pages', () => {
  expect(paginate(orders, 1).totalPages).toBe(3);
});

check('a page size of 0 is rejected', () => {
  expect(() => paginate(orders, 1, 0)).toThrow('pageSize');
});
