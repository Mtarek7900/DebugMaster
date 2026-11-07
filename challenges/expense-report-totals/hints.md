## Reproduce

Press **Run** and sort the checks into failing and passing. A single expense passes but two expenses fail. What else separates the passing checks from the failing ones?

## Read the evidence

Look closely at the wrong total for the taxi and lunch: 4512.5. Can you see the two amounts, `45` and `12.50`, hiding in it?

## Narrow down

Reports from the mobile app are right and reports from the web form are wrong, so what is different about the amounts each one sends? Follow one typed amount through `reportTotals`. Add `console.log(typeof amount, amount)` right after it is parsed and run again.

## Form a theory

In JavaScript, `+` adds two numbers but joins two strings, and if either side is a string, it joins. What type does each amount have when it reaches `total += amount`, and what does `0 + "45"` give?

## Fix

The cleaned-up text has to become a real number before anything adds it up, and the Bug Report says `parseAmount` promises to give a number. Make sure every path out of `parseAmount` returns one.
