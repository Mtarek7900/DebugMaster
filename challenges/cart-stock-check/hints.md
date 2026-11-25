## Reproduce

Press **Run**. A sold-out item at the end works, and lowering a quantity on its own works. Both tickets fail. What do the two tickets' carts have in common that the passing carts don't?

## Read the evidence

In each failing check, which item was handled wrongly? Write each cart out as a numbered list (ticket 1 is 0: Scarf, 1: Gloves, 2: Hat). Where does the mishandled item sit, compared with the item that *was* removed?

## Narrow down

Every item is supposed to be visited by the `for` loop. Add `console.log(i, item.name, cart.items.map((line) => line.name))` as the first line inside the loop and run again. Which items does the loop actually look at?

## Form a theory

When `splice(i, 1)` removes the item at index `i`, what happens to the indexes of every item after it? Then the loop does `i++`. Which item is at the new `i`, and which item did it step over?

## Fix

After removing an item, the next item now sits at the same index as the one just removed, so the loop must look at that index again. Either don't move `i` forward after a removal, or walk the list in a way that removals can't affect.
