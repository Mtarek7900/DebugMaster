## 1. Reproduce

Running the checks shows two failures, one for each ticket. A sold-out item at the end of the cart is removed correctly, a quantity is lowered correctly, and the note text is right, so each piece works on its own. Both failing carts have something in common: a sold-out item with **another item right after it**.

## 2. Read the evidence

- **Ticket 1** expects `['Hat x1']` and gets `['Gloves x1', 'Hat x1']`, with only Scarf removed. The cart was Scarf (0), Gloves (1), Hat (2). Gloves, the item straight after the removed Scarf, survived.
- **Ticket 2** expects `['Hat x1']` and gets `['Hat x3']`. Scarf was removed, but Hat, again the item straight after it, wasn't lowered.

Two different actions, removing and lowering, both missed on the item right after a removal. That points away from the code that decides *what* to do with an item, and towards the code that decides *which items are looked at*.

## 3. Narrow down

Logging at the top of the loop shows what it visits in ticket 1:

```js
console.log(i, item.name, cart.items.map((line) => line.name));
// 0 Scarf ['Scarf', 'Gloves', 'Hat']
// 1 Hat   ['Gloves', 'Hat']
```

There are only two passes for three items, and Gloves is never the current item. In ticket 2 there's only **one** pass: after Scarf goes, the loop stops without ever looking at Hat.

## 4. Form a theory

`cart.items.splice(i, 1)` removes the item at `i` and **shifts every later item down one index**. After Scarf (index 0) is removed, Gloves moves to index 0 and Hat to index 1. Then the loop's `i++` moves on to index 1, which is now Hat. Gloves slid into the slot the loop had just finished with, so it's never checked. In ticket 2, Hat slides to index 0, `i` becomes 1, and `1 < cart.items.length` is false, so the loop ends.

The rule: **removing items from an array while looping forward over it by index skips the item after each removal.**

## 5. Fix

After a removal, stay on the same index so the item that moved into it gets checked:

```js
if (available === 0) {
  removed.push(item.name);
  cart.items.splice(i, 1);
  i--;
}
```

Looping backwards (`for (let i = cart.items.length - 1; i >= 0; i--)`) also works, because removing an item only shifts the items you've already checked. Another option is to build the kept items with `filter` and put them back into the same array with `cart.items.splice(0, cart.items.length, ...kept)`, so the cart screen still sees the change.

## Recognising changing-a-list-while-looping bugs

- **Symptom:** removing items "mostly works", but when two matches sit next to each other, one survives. Any other processing of the item right after a removal is skipped too.
- **Evidence:** log the index and the item on every pass. There are fewer passes than items, and the skipped item always sits straight after a removed one.
- **Usual cause:** `splice` (or `shift`, or deleting entries) inside a forward `for` loop or `forEach` over the same array.
- **Fix:** step back after removing, loop backwards, or build a new list with `filter` instead of changing the one you're looping over.
