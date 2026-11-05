## Reproduce

Press **Run** and sort the checks into failing and passing. What do the failing checks have in common? And what do the passing ones tell you is already working?

## Read the evidence

Compare the expected and actual lists for page 1. How many orders came back, and exactly which order is missing: the first one, the last one, or one in the middle?

## Narrow down

The number of pages is right, so the bug isn't in how pages are counted. Find the lines in `paginate` that decide *which* orders end up on a page, and work out the values of `start` and `end` for page 1 by hand.

## Form a theory

`orders.slice(start, end)` is the only thing that picks the orders. Is the `end` index of `slice` included in the result or not? Try `[1, 2, 3].slice(0, 2)` in your head (or add a `console.log`) and compare it with what the code assumes.

## Fix

`slice` stops *before* `end`, so `end` should be the index one past the last order on the page. Look at how `end` is calculated and whether the `- 1` belongs there.
