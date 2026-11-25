## 1. Reproduce

Running the checks shows two failures, and both involve a bounced address. Every overdue invoice gets a reminder when all the addresses work, paid and not-yet-due invoices are skipped, and the subject line is right. The happy path is fine, and only the failure path is broken.

## 2. Read the evidence

The first failing check expects a report with the bounce on the failed list, and gets:

```js
{ jobStopped: 'Mailbox not found: billing@oldcorp.example' }
```

So the job didn't record the bounce and carry on. The mailer's rejection escaped `sendReminders` completely. The second check shows the knock-on effect: the mailer's `attempted` list is just `['billing@oldcorp.example']`, so the job never even tried Dee's address.

That's odd, because the error is supposed to be caught here:

```js
async function deliver(message, mailer) {
  try {
    return mailer.send(message);
  } catch (error) {
    return { delivered: false, reason: error.message };
  }
}
```

## 3. Narrow down

Adding `console.log('caught', error.message)` inside that `catch` shows it **never runs**. The error isn't caught somewhere and then rethrown. It's never caught at all. So look at what actually happens inside the `try`.

`mailer.send(message)` doesn't throw anything. It's an async function, so calling it immediately returns a **pending promise**, and the "Mailbox not found" error only arrives later, as that promise *rejecting*.

## 4. Form a theory

A `try`/`catch` catches errors thrown **while its block is running**. The `try` here runs one line: call `mailer.send`, get a pending promise, return it. Nothing has failed yet, so the block finishes normally, and the `catch` is skipped.

Returning a promise from an `async` function makes the function's own promise follow it. When the mailer's promise rejects later, `deliver`'s promise rejects too, and `await deliver(...)` in `sendReminders` throws. There's no `try` there, so the whole job stops.

The fix needs the rejection to happen **inside** the `try`. That's what `await` does: it pauses the function until the promise settles, and if the promise rejects, it throws the error at that very line.

## 5. Fix

```js
try {
  return await mailer.send(message);
} catch (error) {
  return { delivered: false, reason: error.message };
}
```

Now `deliver` waits for the mail server's answer while still inside the `try`. A refusal is thrown at the `await` and caught. The bounce goes on the failed list, and the loop moves on to the next invoice. (`return await` is usually redundant, but inside `try`/`catch` it's what makes the `catch` work.)

A `try`/`catch` around `await deliver(...)` in `sendReminders` would also work, but `deliver` is the function that promises to turn failures into `{ delivered: false }`, so fixing it there keeps that promise.

## Recognising missing-`await` bugs

- **Symptom:** a `try`/`catch`, a `finally`, a "loading" flag or a log line that is "obviously" around some async work has no effect on it. Errors escape, cleanup runs too early, or results arrive after the code has moved on.
- **Evidence:** a log inside the `catch` never prints, or "done" is logged before the work it's meant to follow.
- **Usual cause:** an async call whose promise is returned, ignored or passed along without `await`, often `return promise` inside `try`, or `array.forEach(async ...)`.
- **Fix:** `await` the promise in the place where the error handling or ordering is meant to apply, and use `for...of` with `await`, or `Promise.all`, instead of `forEach` with an async callback.
