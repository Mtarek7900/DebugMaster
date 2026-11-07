## 1. Reproduce

Running the checks shows three failures: the taxi and lunch, the amounts with `$` and commas, and the per-category totals. Two checks pass: a single expense, and rejecting `"twelve"`. Anything with **two or more** amounts goes wrong, and one amount on its own is fine.

## 2. Read the evidence

The taxi and lunch should total `57.5` but come out as `4512.5`. Read it as text: `45` followed by `12.5`. The numbers weren't added, they were **joined**. The category check tells the same story: Travel expects `50` (20 + 30) and gets `2030`.

The "$ and commas" check goes further and gives `NaN`. Joining `0`, `"1200.50"` and `"99.50"` produces `"01200.5099.50"`, which has two decimal points and isn't a number at all.

## 3. Narrow down

The Bug Report holds the strongest clue: amounts sent as **numbers** by the mobile app add up correctly, and only **typed text** goes wrong. So the bug is on the path a string takes through the code. Logging inside the loop shows it:

```js
const amount = parseAmount(expense.amount);
console.log(typeof amount, amount); // string 45, then string 12.50
```

`parseAmount` returns a number only when it was given one. When it's given text, it cleans the text up and returns a string:

```js
const cleaned = String(raw).replace(/[$,\s]/g, '');
// ...
return cleaned;
```

## 4. Form a theory

`+` is both addition and string joining. If either side is a string, JavaScript turns the other side into a string and joins them:

- `0 + "45"` is `"045"`.
- `"045" + "12.50"` is `"04512.50"`.

Finally `roundCents` multiplies by 100, and `*` only works on numbers, so it quietly turns `"04512.50"` back into the number `4512.5`. That's why the result *looks* like a number and nothing crashes.

A single expense works by luck: `"045"` becomes `45` again. The validation never complains either, because `isNaN("12.50")` turns the string into a number for its own test and then throws the result away.

## 5. Fix

Return a number from `parseAmount`:

```js
return Number(cleaned);
```

`parseFloat(cleaned)` works too. Changing `total += Number(amount)` in `reportTotals` instead would fix this screen, but every other caller of `parseAmount` would still get strings. Fix the function that breaks its promise.

## Recognising type-coercion bugs

- **Symptom:** values that look **glued together** (`"4512.5"`, `"102030"`), `NaN` from input that looked fine, or comparisons that come out wrong (`"10" < "9"` is `true`).
- **Evidence:** read the bad output as text. If you can see the inputs inside it, something joined strings that should have been added.
- **Usual cause:** values from forms, URLs, `localStorage` or CSV are always strings. `+` joins them, while `-`, `*`, `/` and `isNaN` quietly turn them into numbers, which hides the problem until something adds them.
- **Check:** log `typeof` at the boundary where outside data comes in, and turn it into a number right there, once.
