---
title: Expense report total is way off
difficulty: easy
category: type-coercion
---

Finance has rejected a batch of expense reports because the totals make no sense.

One employee claimed a **$45** taxi and a **$12.50** lunch, and the report says the total is **$4,512.50** instead of $57.50. Reports with a single expense look fine. So do reports sent from the mobile app; only the web form seems to be affected.

**To reproduce:** press **Run**. The checks build reports from amounts typed into the form, the same way the web form sends them.

`reportTotals(expenses)` takes a list of `{ amount, category }` and returns the `total`, the total for each category (`byCategory`) and the `count`. `parseAmount(text)` turns one typed amount such as `"$1,200.50"` into a number. `formatAmount(number)` formats a number for display.
