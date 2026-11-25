## 1. Reproduce

Running the checks shows failures that look unrelated: three good addresses aren't all invited, pasting the same thing twice gives different results, and even the existing-member check can fail. The "same thing twice" check is the most telling. `parseInvites` was called twice with **the same text** and gave two different answers. A function that only looked at its input couldn't do that. Something is being remembered between calls.

## 2. Read the evidence

For the three addresses, Ana and Cy were invited and Ben ended up in `invalid`: the second address, exactly as the admin reported. There's nothing wrong with Ben's address, and the Bug Report says it works on its own.

Calling the validator directly on one address that never changes makes the pattern obvious:

```js
console.log([1, 2, 3, 4].map(() => isValidEmail('ana@acme.example')));
// [true, false, true, false]
```

The answer alternates on every call: "every other address".

## 3. Narrow down

`isValidEmail` is one line, `EMAIL.test(address.trim())`, and the address is the same each time. The only other thing involved is `EMAIL`, a regex created **once**, when the module loads, and shared by every call. Logging it shows it changes (the exact numbers depend on the calls before):

```js
console.log(EMAIL.lastIndex); // 0
isValidEmail('ana@acme.example'); // true
console.log(EMAIL.lastIndex); // 16
isValidEmail('ana@acme.example'); // false
console.log(EMAIL.lastIndex); // 0
```

## 4. Form a theory

The regex has the flags `gi`. The `i` makes it ignore case, which is wanted. The `g` (global) flag makes a regex **stateful**: after a successful `test()` or `exec()`, it saves the position just past the match in `lastIndex`, and the next call starts searching *from there*, even when it's given a different string.

So the first call matches and sets `lastIndex` to 16. The second call starts at position 16, where the pattern's `^` can't match, so it returns `false` and resets `lastIndex` to 0. The third call starts from 0 again and works. That gives true, false, true, false. The results also depend on how many calls came before, which is why the same list gave different answers twice in a row.

`SEPARATORS` also has `g`, but `split` ignores `lastIndex`, so that one is harmless. It's probably where the `g` was copied from.

## 5. Fix

Remove the `g` flag from `EMAIL`:

```js
const EMAIL = /^[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}$/i;
```

Without `g`, `test()` always searches from the start and keeps no state between calls. Validating a whole string never needs `g`. (Resetting `EMAIL.lastIndex = 0` before each `test` would also work, but it hides the real mistake.)

## Recognising global-regex bugs

- **Symptom:** a check gives **alternating** or order-dependent results for the same input: valid, invalid, valid, or "it works on its own but not in a list".
- **Evidence:** call the same function with the same input several times in a row and log the results, plus the regex's `lastIndex`.
- **Usual cause:** a regex with the `g` (or `y`) flag, stored in a shared variable and used with `test()` or `exec()`.
- **Fix:** drop the `g` flag when you only need a yes/no answer. Keep `g` for `replace`, `matchAll` and `match` when you want every match, where it's meant to be.
