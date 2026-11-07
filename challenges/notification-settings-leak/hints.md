## Reproduce

Press **Run**. The first two checks pass and the next two fail. Read the failing ones closely: each one first loads *another* account, then looks at a fresh one. What happens to the fresh account?

## Read the evidence

In the failing check, the fresh account should have `sms: false` but has `sms: true`, the value the *previous* account saved. Look at `email` as well: whose choice is that? Settings are moving from one account to another, so something must be shared between them.

## Narrow down

Add `console.log(JSON.stringify(defaultSettings()))` at the start of a check and again after a call to `settingsFor(...)`. Do the defaults themselves change? Which line in `settingsFor` writes to the settings, and which object is it really writing to?

## Form a theory

`{ ...object }` makes a new outer object, but what does it do with the values *inside* it? After `const copy = { ...DEFAULT_SETTINGS }`, is `copy.channels` a new object or the same one as `DEFAULT_SETTINGS.channels`? Try `copy.channels === DEFAULT_SETTINGS.channels`.

## Fix

Every account needs its own `channels` and `topics` objects, so changing one account's choices can never reach the defaults. The fix belongs where the defaults are handed out, so **Reset to defaults** is safe as well.
