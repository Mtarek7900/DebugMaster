## Reproduce

Press **Run**. Which shortcuts fail, and which panel do they open instead? Is it the same wrong panel every time?

## Read the evidence

Every shortcut opens the **last** panel, yet the cheat sheet, built by a loop that looks almost the same, is correct. The keys `Alt+1`, `Alt+2` and `Alt+3` clearly exist, so it isn't the set of keys that's wrong. What's wrong is what each key *does* when it's pressed.

## Narrow down

Add `console.log('pressed', panel.id)` inside the function stored for each shortcut, and `console.log('loop', panel.id)` just after `var panel = panels[i]`. Compare **when** each line runs and the value of `panel` each time.

## Form a theory

The loop finishes long before anyone presses a key. When a handler finally runs, it looks up `panel`, but which `panel`? Does each pass through the loop get its own `panel` variable, or is there just one that each pass overwrites? Think about how `var` is scoped.

## Fix

Each handler needs to keep hold of *its own* panel. Give every pass through the loop a fresh variable, so that each function keeps the panel it was created for.
