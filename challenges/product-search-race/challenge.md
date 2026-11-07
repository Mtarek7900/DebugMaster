---
title: Search shows results for the wrong query
difficulty: hard
category: async-race
---

Shoppers say the search box in the header sometimes shows results that don't match what they typed.

One shopper typed **laptop** and got **lapel pins** and laptops, which are the results for **lap**. Typing slowly never goes wrong, and it's worst on mobile data. The loading spinner also disappears while the newest search is still running. The search service always returns the right results for each query it is asked, and the team has checked its logs.

**To reproduce:** press **Run**. The checks use a pretend search service that answers only when the check says so, so you can choose the order the answers arrive in.

`createSearchBox(searchProducts)` returns a search box. `type(text)` is called with the box's full text after every keystroke, and `view()` returns what the screen shows: `{ query, results, loading, error }`. `searchProducts(query)` returns a promise of the matching product names.
