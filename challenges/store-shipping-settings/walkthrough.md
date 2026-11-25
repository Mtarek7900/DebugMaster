## 1. Reproduce

Running the checks shows two failures, Willow & Wax and Bluebird Books. Everything else passes: the default shop, free shipping over $50, the shop with a $2.50 fee and the quantity limit. Both failing shops set something to **zero**, and the shop whose setting works chose a number that isn't zero. That's already a strong lead.

## 2. Read the evidence

Willow & Wax gets shipping `4.99` where `0` was expected, and Bluebird Books gets tax `1.44` (8% of $18) where `0` was expected. Both actual values are exactly what a shop on the **platform defaults** would pay. The setting isn't miscalculated. It's thrown away and replaced with the default.

## 3. Narrow down

Every setting goes through one function:

```js
export function shopSetting(settings, name) {
  return settings[name] || PLATFORM_DEFAULTS[name];
}
```

Calling it directly confirms it:

```js
console.log(shopSetting({ shippingFee: 2.5 }, 'shippingFee')); // 2.5
console.log(shopSetting({ shippingFee: 0 }, 'shippingFee'));   // 4.99
```

## 4. Form a theory

`||` returns its left side if that side is **truthy**, and otherwise its right side. JavaScript has a short list of falsy values: `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined` and `NaN`. So `0 || 4.99` is `4.99`. The code was meant to say "use the default when the shop didn't set this", but what it actually says is "use the default whenever the shop's value is falsy". Zero is a perfectly good shipping fee and tax rate, and it's falsy.

The same bug also hits a free-shipping threshold of `0`, which is meant to ship every order free.

## 5. Fix

Use the nullish coalescing operator, `??`, which falls back only on `null` and `undefined`:

```js
return settings[name] ?? PLATFORM_DEFAULTS[name];
```

Now `0 ?? 4.99` is `0`, while a setting that's left out, `undefined ?? 4.99`, is still `4.99`.

Patching only the shipping line, for example with `shippingFee === 0 ? 0 : …`, would fix Willow & Wax but leave the tax rate and the free-shipping threshold broken. Fix the one place every setting goes through.

## Recognising falsy-default bugs

- **Symptom:** a value of `0`, `''` or `false` behaves as if nobody set it. Free things still cost something, an empty field becomes "Untitled", or a switched-off option switches itself back on.
- **Evidence:** the wrong value is exactly the **default**, and only "empty-looking" inputs are affected.
- **Usual cause:** `value || fallback`, or `if (!value)`, used to mean "if missing".
- **Fix:** use `value ?? fallback` (or `value === undefined`) when only a missing value should fall back. Keep `||` for when every falsy value really should be replaced.
