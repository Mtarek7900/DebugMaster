const item = (sku, name, quantity) => ({ sku, name, quantity });
const inCart = (cart) => cart.items.map((line) => `${line.name} x${line.quantity}`);

check('a sold-out item at the end is removed', () => {
  const cart = { items: [item('HAT', 'Hat', 1), item('SCF', 'Scarf', 1)] };
  const changes = applyStock(cart, { HAT: 5 });
  expect(inCart(cart)).toEqual(['Hat x1']);
  expect(changes).toEqual({ removed: ['Scarf'], lowered: [] });
});

check('a quantity is lowered to what is left', () => {
  const cart = { items: [item('HAT', 'Hat', 3)] };
  const changes = applyStock(cart, { HAT: 1 });
  expect(inCart(cart)).toEqual(['Hat x1']);
  expect(changes).toEqual({ removed: [], lowered: ['Hat'] });
});

check('ticket 1: scarf and gloves both sold out', () => {
  const cart = { items: [item('SCF', 'Scarf', 1), item('GLV', 'Gloves', 1), item('HAT', 'Hat', 1)] };
  const changes = applyStock(cart, { SCF: 0, GLV: 0, HAT: 4 });
  expect(inCart(cart)).toEqual(['Hat x1']);
  expect(changes).toEqual({ removed: ['Scarf', 'Gloves'], lowered: [] });
});

check('ticket 2: a sold-out scarf, then 3 hats with 1 left', () => {
  const cart = { items: [item('SCF', 'Scarf', 1), item('HAT', 'Hat', 3)] };
  const changes = applyStock(cart, { SCF: 0, HAT: 1 });
  expect(inCart(cart)).toEqual(['Hat x1']);
  expect(changes).toEqual({ removed: ['Scarf'], lowered: ['Hat'] });
});

check('the note lists what changed', () => {
  expect(stockNote({ removed: ['Scarf', 'Gloves'], lowered: ['Hat'] })).toBe('Removed: Scarf, Gloves. Fewer left: Hat.');
});
