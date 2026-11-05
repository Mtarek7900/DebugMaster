## 1. Reproduce

Running the checks shows two failures: page 1 and page 2 each come back with 9 orders instead of 10. Two checks pass: "25 orders make 3 pages" and "the last page shows the remaining 5 orders". That pattern is already a lead: whole pages are short, but the page count is right.

## 2. Read the evidence

The failing check for page 1 expects `[1001, …, 1010]` and gets `[1001, …, 1009]`. The *last* order of the page is the one missing, not the first. Page 2 then starts correctly at #1011, so #1010 falls into the gap between the two pages and never appears anywhere.

The last page passes only by luck. It has just 5 orders, and `slice` happily stops at the end of the array whatever `end` you give it, so a too-small `end` isn't noticed there.

## 3. Narrow down

The page count comes from `Math.ceil(orders.length / pageSize)`, and it's correct. Which orders appear is decided by three lines:

```js
const start = (current - 1) * pageSize;
const end = start + pageSize - 1;
// ...
orders: orders.slice(start, end),
```

For page 1 with a page size of 10, that gives `start = 0` and `end = 9`.

## 4. Form a theory

`Array.prototype.slice(start, end)` returns the elements from `start` **up to but not including** `end`. So `slice(0, 9)` returns indexes 0–8: nine orders. The `- 1` was written as if `end` meant "index of the last order on the page", but `slice` wants "index one past the last order". Treating an exclusive bound as inclusive like this is a classic off-by-one.

## 5. Fix

Remove the `- 1`:

```js
const end = start + pageSize;
```

Now page 1 is `slice(0, 10)` (indexes 0–9, ten orders), page 2 is `slice(10, 20)`, and every order appears on exactly one page.

## Recognising off-by-one bugs

- **Symptom:** one item too many or too few, usually at the edge of a range: the first or last element of a page, loop or string.
- **Evidence:** compare expected and actual and ask *which end* is wrong. Here the missing item was always the last one on a page.
- **Usual cause:** mixing up inclusive and exclusive bounds (`slice`, `substring` and `for (i = 0; i < n; i++)` are all end-exclusive), or mixing 0-based and 1-based numbering.
- **Check:** work through the smallest case by hand (page size 1, a one-element array) and write down the actual indexes.
