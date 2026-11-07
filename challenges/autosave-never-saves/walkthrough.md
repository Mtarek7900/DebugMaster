## 1. Reproduce

Running the checks shows two failures: typing never shows "Unsaved changes", and the next interval saves nothing (`[]` instead of `['Dear Sam,']`). The two checks that pass are the ones where nothing is typed. And there's no error anywhere, which makes this harder than a crash: the code runs, it just has no effect.

## 2. Read the evidence

Everything that doesn't depend on typing works: the initial status, and saving nothing when nothing changed. Everything that depends on typing fails. The Bug Report rules out the two obvious suspects: the editor does announce changes, and the storage does save. So the link between them, the `'change'` listener, is where to look.

## 3. Narrow down

Logging inside `handleChange` shows it **does** run on every keystroke. So the listener is registered and called. Next, log what it changes:

```js
handleChange(text) {
  console.log(this instanceof Autosave, this);
  // false, then the pretend editor object, with its `on` and `type` methods
  this.latestText = text;
  this.dirty = true;
}
```

Inside `handleChange`, `this` is **the editor**, not the `Autosave`. Each keystroke sets `dirty` and `latestText` on the editor object, so the `Autosave` keeps `dirty: false` for ever. `flush()` sees nothing to save, and `status()` reports "No changes yet".

## 4. Form a theory

A method doesn't remember which object it came from. `this` is decided **each time the function is called**, by how it's called:

- `autosave.handleChange(text)`: `this` is `autosave`.
- `listener(text)` as a plain call: `this` is `undefined` (in strict mode, which class bodies always use). That would at least crash.
- `listener.call(editor, text)`: `this` is `editor`.

`editor.on('change', this.handleChange)` hands the editor the bare function, with no link to the `Autosave`. The editor calls listeners the way DOM events do, with `this` set to itself (look at `listener.call(this, text)` in the pretend editor). So `this.dirty = true` quietly creates a `dirty` property on the editor. No error, no effect.

The interval works because it was written as an arrow function, `() => this.flush()`. Arrow functions have no `this` of their own and use the one around them, which is the `Autosave`.

## 5. Fix

Hand the editor a function that calls the method on the right object:

```js
editor.on('change', (text) => this.handleChange(text));
```

These work too:

- `this.handleChange = this.handleChange.bind(this);` in the constructor, before registering.
- Defining `handleChange = (text) => { ... }` as a class field.

## Recognising `this`-binding bugs

- **Symptom:** a method that works when called directly (`obj.method()`) but does nothing or crashes when passed as a callback: to an event listener, `setTimeout`, `.then`, `map` or `forEach`. You may see "Cannot read properties of undefined", or no error at all.
- **Evidence:** log `this` inside the method. If it's `undefined`, the global object or some other object (an element, an emitter), the method lost its object on the way.
- **Usual cause:** passing `obj.method` without calling it. The function travels on its own, and the caller decides `this`.
- **Check:** wherever a method is handed to someone else, wrap it in an arrow function or `bind` it, or define it as an arrow-function class field.
