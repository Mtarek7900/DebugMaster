## Reproduce

Press **Run**. Some failures are about lists, and one is about pasting the *same* thing twice. A function that gives a different answer for the same input is remembering something between calls. Keep that in mind.

## Read the evidence

In "three good addresses", which one was marked invalid? Now call `isValidEmail` on one good address several times in a row: `console.log([1, 2, 3, 4].map(() => isValidEmail('ana@acme.example')))`. The address never changes. Does the answer?

## Narrow down

`isValidEmail` is one line, and the address passed in is the same every time. So whatever changes between calls must live *outside* the function and survive from one call to the next. Which value outside `isValidEmail` does it use, and could that value be changing? Try logging `EMAIL.lastIndex` before and after each call.

## Form a theory

Look closely at the flags at the end of the `EMAIL` regex. What does the `g` flag make `test()` do with `lastIndex`, and where does the *next* `test()` start searching?

## Fix

Checking whether a whole string is an email address never needs to "continue from where the last match ended". Make sure every call to `test` starts from the beginning of the string.
