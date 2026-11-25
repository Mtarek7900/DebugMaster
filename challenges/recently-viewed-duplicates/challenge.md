---
title: Recently viewed shows the same product twice
difficulty: medium
category: reference-equality
---

The **Recently viewed** strip at the bottom of product pages is meant to show the last 5 products a shopper opened, newest first, with **each product only once**.

Shoppers are seeing duplicates. One shopper opened the **Desk lamp**, then an **Office chair**, then went back to the Desk lamp from the search results. The strip showed *Desk lamp, Office chair, Desk lamp*. Another shopper says the strip filled up with the same two products and pushed out everything else. Clicking a product **in the strip itself** never makes a duplicate.

Every product page loads its product from the server when it opens.

**To reproduce:** press **Run**. The checks use a pretend server where `loadProduct(id)` returns the product the way the real one does.

`createRecentlyViewed()` returns the strip. `opened(product)` is called whenever a product page opens, `remove(productId)` takes a product out of the strip, and `names()` lists the products shown, newest first.
