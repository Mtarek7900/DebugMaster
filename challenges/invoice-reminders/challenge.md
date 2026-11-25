---
title: One bounced email stops every reminder
difficulty: hard
category: missing-await
---

Every night a job emails a reminder about each overdue invoice. If a reminder can't be delivered, it is supposed to go on the **failed** list so the accounts team can phone that customer instead, and the job carries on with the rest.

Last night one customer's email address bounced. The job **stopped** with `Mailbox not found: billing@oldcorp.example`, and none of the customers after them got a reminder. The failed list the accounts team relies on was empty. The developer who wrote the job points out that sending is wrapped in a `try`/`catch` written for exactly this case. On nights when every address works, the job is fine.

**To reproduce:** press **Run**. The checks use a pretend mailer that can be told which addresses bounce. Like the scheduler, the checks report a job that stopped as `{ jobStopped: <error message> }`.

`sendReminders(invoices, mailer, today)` sends the reminders and resolves with `{ sent, failed }`: the ids of the invoices reminded, and `{ id, reason }` for each one that couldn't be. `mailer.send(message)` returns a promise. It resolves with `{ delivered: true, messageId }` when the mail server accepts the message, and rejects with an error when it refuses it. Dates are `'YYYY-MM-DD'` strings.
