## Reproduce

Press **Run**. Which checks fail, and which pass? Notice that nothing crashes: there are no errors, just wrong answers. What do the two passing checks have in common?

## Read the evidence

The passing checks are the ones where nothing is typed. As soon as the editor reports a change, autosave behaves as if it never heard about it: the status stays "No changes yet" and nothing is saved. Yet the Bug Report says the editor really does announce every change. So the announcement arrives, but its effect goes missing.

## Narrow down

Put a `console.log` inside `handleChange` to check it really runs when you type. Then log `this` there, and `this instanceof Autosave`. Is `this` the object you expect?

## Form a theory

In JavaScript, `this` inside a regular function or method isn't fixed when the method is written: it's decided by **how the function is called**. `this.handleChange` is passed to the editor as a plain function. Look at how the pretend editor calls its listeners. What does that make `this`, and where do `this.dirty = true` and `this.latestText` end up?

## Fix

The editor must call a listener that, whatever `this` it's given, still updates *this* `Autosave`. You can do that where the listener is handed to the editor.
