---
title: Free shipping still charges $4.99
difficulty: easy
category: falsy-default
---

Two shop owners have written in about their checkout settings being ignored.

**Willow & Wax** set their shipping fee to **$0** to offer free shipping on everything, but their customers are still charged **$4.99** on small orders. **Bluebird Books** sells books, which are tax-free where they are, so they set their tax rate to **0**. Their customers are still charged 8% tax. Shops that set their *own* fee, such as $2.50, say it works fine.

**To reproduce:** press **Run**. The checks build carts for a shop that uses the platform defaults and for shops with their own settings.

`checkoutSummary(cart, settings)` returns `{ subtotal, shipping, tax, total }` for a cart of `{ name, price, quantity }` lines. A shop's `settings` can override any of the platform defaults: the shipping fee, the order size that ships free, the tax rate and the most of one item a customer can buy. Any setting the shop leaves out uses the platform default.
