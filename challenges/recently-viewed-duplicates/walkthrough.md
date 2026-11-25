## 1. Reproduce

Running the checks shows one failure: going back to a product from search. Newest-first order and the **x** both work. Most usefully, "clicking a product in the strip" passes, even though it also reopens the Desk lamp. Two checks do the same thing to the strip, and only one fails.

## 2. Read the evidence

The failing check expects `['Desk lamp', 'Office chair']` and gets `['Desk lamp', 'Office chair', 'Desk lamp']`. The new lamp was put at the front, but the old one was never taken out, so the code that looks for an earlier copy didn't find it.

Now compare the two checks. The passing one keeps one `lamp` object and passes **the same object** to `opened` twice. The failing one calls `loadProduct(1)` twice, and the pretend server, like the real one, returns **a fresh copy** each time. The Bug Report says the same thing: clicking in the strip reuses the strip's own object, while opening from search loads the product again.

## 3. Narrow down

The search for an earlier copy is one line:

```js
const earlier = products.indexOf(product);
```

Logging it during the failing check:

```js
console.log(products.indexOf(product), products.map((p) => p.id), product.id);
// -1 [2, 1] 1
```

The id is right there in the list, but `indexOf` says `-1`.

## 4. Form a theory

`indexOf` compares with `===`. For objects, `===` is **reference equality**: it asks whether both sides are the very same object in memory, not whether they have the same contents. `{ id: 1 } === { id: 1 }` is `false`. Two copies of the Desk lamp from the server are two different objects, so the strip doesn't recognise the reopened lamp and adds it again.

Meanwhile `remove` works, because it compares ids: `product.id !== productId`.

## 5. Fix

Find the earlier copy by the product's **id**, the same way `remove` does:

```js
const earlier = products.findIndex((seen) => seen.id === product.id);
```

Keep putting the **new** object at the front, so a price that changed on the server shows up in the strip. Comparing names wouldn't work, because two different products can share a name. Comparing `JSON.stringify` output would treat a product whose price changed as a different product.

## Recognising reference-equality bugs

- **Symptom:** duplicates appear, or "already added" checks fail, but only when the data has come through a server, a copy (`{ ...obj }`, `structuredClone`), `JSON.parse` or a new render, and never when the same object is reused.
- **Evidence:** the thing you're looking for is "obviously" there when you log it, yet `indexOf`, `includes`, `===`, `Set.has` or `Map.get` can't find it.
- **Usual cause:** comparing objects with `===` (directly or through `indexOf`, `includes`, `Set` or `Map` keys) when what matters is which thing they *describe*.
- **Fix:** compare by a stable identity such as an id (`findIndex`, `some`), or key a `Map` or `Set` by that id rather than by the object.
