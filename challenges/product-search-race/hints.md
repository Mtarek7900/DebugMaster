## Reproduce

Press **Run**. Two checks fail. Compare them with "answers in order show the results for the newest text", which passes. The searches are the same; what is different about the order the answers arrive in?

## Read the evidence

In "a slow answer for older text does not replace newer results", the box says `laptop` but shows the results for `lap`, which was the *last* answer to arrive, not the newest search. In the loading check, the spinner turns off as soon as *any* answer arrives. The code seems to accept every answer as if it were the newest.

## Narrow down

The code does have a guard meant to throw away out-of-date answers. Find it, then log `thisSearch` and `searchCount` just before the `if` that compares them. Run again and look at the two numbers for the `lap` answer that arrives late.

## Form a theory

`await` pauses `type` and lets other code run (more keystrokes, more searches) before it continues. What was `thisSearch` meant to remember? Compare *when* each value in the guard is read with when the `await` happens, and ask whether the two values can ever differ.

## Fix

Each call to `type` should remember which search it started *before* it waits for the answer, then compare that with the latest search once the answer is back. Look at where `thisSearch` gets its value.
