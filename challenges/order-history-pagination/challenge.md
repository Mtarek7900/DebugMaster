---
title: Missing orders in My Orders
difficulty: easy
category: off-by-one
---

Customers are reporting that orders go missing from the **My Orders** screen.

One customer with 25 orders says page 1 lists only 9 orders where it should list 10. Order **#1010** is not on page 1, and it isn't on page 2 either, which starts at #1011. The order is still in the database, so it seems to disappear only on screen. Their last page looks fine.

**To reproduce:** press **Run**. The checks page through 25 orders, 10 per page.

The screen expects `paginate(orders, page, pageSize)` to return the orders for that page (pages are numbered from 1), along with the page number, page size, total number of pages and whether there are previous or next pages.
