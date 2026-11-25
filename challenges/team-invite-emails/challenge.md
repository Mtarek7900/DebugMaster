---
title: Every other invite address is rejected
difficulty: hard
category: global-regex
---

The **Invite your team** form lets an admin paste a list of email addresses, separated by commas, semicolons or new lines. Valid addresses get an invite. Anything that isn't an email address is shown back in red so it can be corrected, and people who are already members are skipped.

Admins say perfectly good addresses are being shown in red. One admin pasted `ana@acme.example, ben@acme.example, cy@acme.example`. Ana and Cy were invited, but **Ben** was marked as not an email address. When they pasted Ben's address again *on its own*, it worked. Another admin says the form "rejects every second address". Support tried the same list twice in a row and got different results each time.

**To reproduce:** press **Run**.

`parseInvites(text, members)` returns `{ invite, invalid, skipped }`. `invite` holds the addresses to invite, lower-cased and each once. `invalid` holds the text that isn't an email address, exactly as typed. `skipped` holds addresses that belong to existing `members`. `isValidEmail(address)` is also used on its own by the form's single-address field.
