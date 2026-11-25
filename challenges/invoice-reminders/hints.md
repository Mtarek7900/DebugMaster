## Reproduce

Press **Run**. Everything passes until an address bounces. Look at the actual value in the failing checks. Did the job record a failure, or did it stop?

## Read the evidence

`{ jobStopped: 'Mailbox not found: …' }` means the mailer's error escaped all the way out of `sendReminders`. Yet `deliver` has a `try`/`catch` for exactly this error. So the question isn't "why did sending fail?" but "why didn't the `catch` catch it?"

## Narrow down

Put a `console.log('caught', error.message)` inside the `catch` in `deliver` and run again. Does it ever print? Then think about **when** the error happens: during the call to `mailer.send(message)`, or later?

## Form a theory

`mailer.send` doesn't throw. It returns a promise straight away, and that promise *rejects* a little later. When the line inside `try` runs, nothing has gone wrong yet. What does `return somePromise` inside a `try` do, and has the `try` block already finished by the time the promise rejects?

## Fix

The `try` only protects what happens while it is running. Make `deliver` wait for the promise to settle *inside* the `try`, so that a rejection becomes an error thrown there, where the `catch` can see it.
