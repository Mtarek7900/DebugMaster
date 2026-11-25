const item = (sku, name, quantity) => ({ sku, name, quantity });
const names = (cart) => cart.items.map((line) => line.name);
const sorted = (list) => [...list].sort();

check('a cart where everything has sold out ends up empty', () => {
  const cart = { items: [item('A', 'Mug', 1), item('B', 'Bowl', 2), item('C', 'Plate', 1), item('D', 'Jug', 1)] };
  const changes = applyStock(cart, {});
  expect(cart.items).toEqual([]);
  expect(sorted(changes.removed)).toEqual(['Bowl', 'Jug', 'Mug', 'Plate']);
});

check('every other item sold out', () => {
  const cart = { items: [item('A', 'Mug', 1), item('B', 'Bowl', 1), item('C', 'Plate', 1), item('D', 'Jug', 1)] };
  applyStock(cart, { B: 3, D: 3 });
  expect(names(cart)).toEqual(['Bowl', 'Jug']);
});

check('sold-out items at the end are removed', () => {
  const cart = { items: [item('A', 'Mug', 2), item('B', 'Bowl', 1), item('C', 'Plate', 1)] };
  const changes = applyStock(cart, { A: 1 });
  expect(names(cart)).toEqual(['Mug']);
  expect(cart.items[0].quantity).toBe(1);
  expect(changes.lowered).toEqual(['Mug']);
});

check('items after a run of sold-out items are still lowered', () => {
  const cart = { items: [item('A', 'Mug', 1), item('B', 'Bowl', 1), item('C', 'Plate', 1), item('D', 'Jug', 4)] };
  const changes = applyStock(cart, { D: 2 });
  expect(cart.items).toEqual([item('D', 'Jug', 2)]);
  expect(changes.lowered).toEqual(['Jug']);
});

check('the cart object the screen holds is the one updated', () => {
  const cart = { items: [item('A', 'Mug', 1), item('B', 'Bowl', 1)] };
  const screenCopy = cart;
  applyStock(cart, { B: 1 });
  expect(names(screenCopy)).toEqual(['Bowl']);
});

check('a cart with enough stock is left alone', () => {
  const cart = { items: [item('A', 'Mug', 1), item('B', 'Bowl', 2)] };
  const changes = applyStock(cart, { A: 9, B: 2 });
  expect(cart.items).toEqual([item('A', 'Mug', 1), item('B', 'Bowl', 2)]);
  expect(changes).toEqual({ removed: [], lowered: [] });
  expect(stockNote(changes)).toBe('');
});
