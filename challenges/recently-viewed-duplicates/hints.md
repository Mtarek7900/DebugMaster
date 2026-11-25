## Reproduce

Press **Run**. Two checks reopen the Desk lamp, and only one of them fails. Read both checks side by side. What is different about *how* they open the lamp the second time?

## Read the evidence

The failing check gets `['Desk lamp', 'Office chair', 'Desk lamp']`, so the lamp was added again instead of being moved. The code tried to find the earlier lamp and didn't find it. Look at what `loadProduct` does in the checks. Is the second lamp the same object as the first, or another object that looks the same?

## Narrow down

Inside `opened`, log how the code looks for the earlier copy: `console.log(products.indexOf(product), products.map((p) => p.id), product.id)`. The id is in the list, so why isn't the product found?

## Form a theory

`indexOf` compares with `===`. For objects, `===` doesn't compare their contents. What does it compare? Try `console.log({ id: 1 } === { id: 1 })`.

## Fix

The strip should treat two objects as the same product when they describe the same product, whichever copy the server sent. `remove` already knows how to recognise a product. Find the earlier copy the same way.
