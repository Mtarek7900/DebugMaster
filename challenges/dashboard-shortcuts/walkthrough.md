## 1. Reproduce

Running the checks shows two failures: Alt+1 and Alt+2 both open `signups` instead of `revenue` and `traffic`. Alt+3 passes, and so do the cheat sheet and the unknown key. Every shortcut opens the same panel, the **last** one, and Alt+3 only passes because the last panel is what it should open.

## 2. Read the evidence

The shortcuts exist: `press('Alt+1')` finds a handler, and an unknown key correctly does nothing. The cheat sheet loop runs through exactly the same panels with exactly the same `i` and gets every line right. So the loop sees the right panels; what goes wrong is how a handler remembers its panel for **later**.

## 3. Narrow down

Logging inside the loop and inside the handler shows the timing:

```text
loop revenue
loop traffic
loop signups
pressed signups   ← Alt+1
pressed signups   ← Alt+2
```

All three handlers are created while the loop runs, but none of them runs until a key is pressed, after the loop has finished. By then, every handler reads `panel` as `signups`.

## 4. Form a theory

A function doesn't copy the variables it uses; it keeps a live link to them (a **closure**). That's fine if every handler links to a *different* `panel`. But `var` is scoped to the whole **function**, not to the loop body. So `var panel = panels[i]` doesn't create a new variable each time round; it reassigns the single `panel` shared by all three handlers. When the loop ends, that one variable holds the last panel, and that's what every handler sees.

The cheat sheet is unaffected because it reads `panels[i]` **straight away**, inside the loop, instead of keeping a function to run later.

## 5. Fix

Give each pass through the loop its own variable. `let` and `const` are scoped to the block, so every pass gets a fresh `panel`:

```js
const panel = panels[i];
```

Changing only `var i` to `let i` isn't enough here, because the handlers don't use `i`: they use `panel`. Other fixes that work are `panels.slice(0, MAX_SHORTCUTS).forEach((panel, i) => { ... })` (each call gets its own `panel`), or a handler factory such as `shortcuts[key] = openerFor(panel)`.

## Recognising closure-in-a-loop bugs

- **Symptom:** callbacks, handlers or timers created in a loop that all act on the **last** item, or on `undefined` (one past the end).
- **Evidence:** the same wrong value no matter which callback runs, while code that uses the loop variable *straight away* is correct.
- **Usual cause:** `var` in a loop (one shared variable, not one per pass), combined with a function that runs later: an event handler, `setTimeout` or a promise callback.
- **Check:** ask *when* the function runs and *which* variable it reads at that moment. Use `let`/`const`, or `forEach`/`map`, so each pass has its own variables.
