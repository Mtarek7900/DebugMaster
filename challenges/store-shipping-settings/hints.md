## Reproduce

Press **Run** and sort the checks into failing and passing. Both failing shops changed a setting, and so did the shop with a $2.50 fee, which passes. What is different about the values in the failing checks?

## Read the evidence

For Willow & Wax, the actual shipping is exactly `4.99`, the platform default. The shop's setting isn't being misread as some other number. It's being ignored completely. Where in the code does a default get used instead of a shop's own value?

## Narrow down

Every setting goes through `shopSetting`. Call it directly: `console.log(shopSetting({ shippingFee: 0 }, 'shippingFee'), shopSetting({ shippingFee: 2.5 }, 'shippingFee'))`. Which one gives back what the shop asked for?

## Form a theory

`a || b` doesn't mean "`a` if it was set, otherwise `b`". It means "`a` if `a` is *truthy*, otherwise `b`". Which values are falsy in JavaScript? Is `0` one of them?

## Fix

The default should be used only when the shop **didn't set** a value (it's `undefined` or `null`), not whenever the value is falsy. JavaScript has an operator that falls back only on `null` and `undefined`.
