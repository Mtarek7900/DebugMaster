## Reproduce

Press **Run** and sort the checks into failing and passing. A single expense passes but two expenses fail. What else separates the passing checks from the failing ones?

## Read the evidence

Look closely at the wrong total for the taxi and lunch: 4512.5. Can you see the two amounts, `45` and `12.50`, hiding in it? What operation would turn 45 and 12.50 into that?

## Narrow down

The report is right when the mobile app sends numbers and wrong when the web form sends text. So follow one typed amount through `reportTotals`. Add `console.log(typeof amount, amount)` right after it is parsed and run again.

## Form a theory

In JavaScript, `+` adds two numbers but joins two strings, and if either side is a string, it joins. What type does each amount have when it reaches `total += amount`, and what does `0 + "45"` give?

## Fix

The cleaned-up text has to become a real number before anything adds it up, and the Bug Report says other screens rely on `parseAmount` giving a number too. Make sure every path out of `parseAmount` returns one.
