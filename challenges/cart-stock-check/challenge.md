---
title: Sold-out items stay in the cart
difficulty: medium
category: mutation-during-iteration
---

Before checkout, the shop checks the cart against current stock. Sold-out items should be taken out of the cart, and items with too little stock should have their quantity lowered. The customer sees a note listing what changed.

Support has two tickets:

- A customer's cart held a **scarf**, **gloves** and a **hat**, in that order. The scarf and gloves had both sold out. The note said only the scarf was removed. The gloves stayed in the cart, and payment then failed with "Gloves are out of stock".
- Another customer had a sold-out **scarf** followed by **3 hats** when only 1 hat was left. The scarf was removed, but the hats stayed at 3, and payment failed again.

Carts with one sold-out item at the end, or with only low stock, work fine.

**To reproduce:** press **Run**.

`applyStock(cart, stock)` updates `cart.items` in place, because the cart screen holds on to the cart. `stock` maps each item's `sku` to how many are left (a missing sku means 0). It returns `{ removed, lowered }`: the names of the items taken out and the names of those whose quantity went down.
