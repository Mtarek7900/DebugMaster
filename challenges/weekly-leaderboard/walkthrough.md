## 1. Reproduce

Running the checks shows one failure: this week's leaderboard. Last week's leaderboard, the tie check and the row text all pass. The Bug Report says nobody scored over 999 last week, and the checks show it: last week's scores were all three digits (875, 610, 430), while this week's mix four digits, three digits and two digits (1200, 950, 80).

## 2. Read the evidence

The check expects Priya (1200), Tom (950), Ana (80) and gets Tom, Ana, Priya: **950, 80, 1200**. That isn't the right order or the reverse of it, so the code isn't confusing "highest first" with "lowest first". Now read the scores as words in a dictionary. `"1200"` starts with `1`, `"80"` with `8` and `"950"` with `9`, so alphabetically they go `"1200"`, `"80"`, `"950"`. Reversed, that's exactly what came out.

## 3. Narrow down

The ties come out alphabetically, so sorting by name works. The order of the scores is decided on one line:

```js
const scores = [...new Set(byName.map((entry) => entry.score))].sort().reverse();
```

Logging confirms it:

```js
console.log([950, 1200, 80].sort()); // [1200, 80, 950]
```

## 4. Form a theory

With no compare function, `Array.prototype.sort()` turns every element into a **string** and sorts the strings character by character. It does that even when every element is a number. So `"1200" < "80"`, because `'1' < '8'`. Numbers with the same number of digits happen to sort correctly as strings, which is why last week's leaderboard was right and this week's isn't.

Look at the line above it: the names are sorted with a compare function, `a.name.localeCompare(b.name)`. The scores were left with the default.

## 5. Fix

Sort the scores as numbers, highest first:

```js
const scores = [...new Set(byName.map((entry) => entry.score))].sort((a, b) => b - a);
```

The compare function returns a negative number when `a` should come first. `b - a` is negative when `a` is the bigger score, so the biggest score ends up first and the `reverse()` isn't needed.

## Recognising default-sort bugs

- **Symptom:** numbers come out in an order that works for small values but breaks once lengths differ: 10 before 9, or 100 before 25.
- **Evidence:** read the wrong order as text. If it's alphabetical, the sort compared strings.
- **Usual cause:** calling `.sort()` with no compare function on numbers (or dates, or objects).
- **Fix:** always pass a compare function: `(a, b) => a - b` for ascending numbers, `(a, b) => b - a` for descending, and `localeCompare` for text people will read.
