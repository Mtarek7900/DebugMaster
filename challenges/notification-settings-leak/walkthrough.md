## 1. Reproduce

Running the checks shows two failures: "one account's choices do not change the next account's settings" and "Reset to defaults switches promotions off again". The others pass, including the first two. A brand-new account looks right, and an account's own saved choices are applied correctly. Things only go wrong for an account loaded **after** another one.

## 2. Read the evidence

The next-account check expects `{ email: true, push: true, sms: false }` and gets `{ email: false, push: true, sms: true }`. Both wrong values were saved by earlier accounts: `sms: true` by the account loaded just before, and `email: false` by the one in the second check. The Reset check says the same thing about topics: promotions is still on because an earlier account switched it on.

So the accounts aren't independent: they share something, and it outlives each call. The Bug Report agrees: a server restart "fixes" it, which means module-level state is building up.

## 3. Narrow down

The only state that lives between calls is the module's `DEFAULT_SETTINGS`. Log it as a string (so you see its value at that moment, not later) around the first call in the failing check:

```js
console.log(JSON.stringify(defaultSettings().channels)); // {"email":false,"push":true,"sms":false}
settingsFor({ channels: { sms: true } });
console.log(JSON.stringify(defaultSettings().channels)); // {"email":false,"push":true,"sms":true}
```

The defaults themselves changed: `sms` flipped during that one call, and `email` was already wrong before it, left over from the previous check. The only lines that write anything are in `settingsFor`:

```js
const settings = defaultSettings();
// ...
settings.channels[channel] = on;
```

`settings` is supposed to be this account's own copy, so writing to it should be harmless. Unless `settings.channels` isn't a copy at all.

## 4. Form a theory

`defaultSettings()` returns `{ ...DEFAULT_SETTINGS }`. Spread syntax makes a **shallow** copy: a new outer object whose properties have the same values as before. For `channels` and `topics` those values are *references* to objects, so the copy points at the very same inner objects:

```js
const copy = { ...DEFAULT_SETTINGS };
copy === DEFAULT_SETTINGS;                   // false: a new outer object
copy.channels === DEFAULT_SETTINGS.channels; // true: the same inner object
```

So `settings.channels[channel] = on` writes straight into `DEFAULT_SETTINGS.channels`. Every later account, and every Reset, starts from defaults that are no longer the defaults. `quietHours` doesn't leak, because `settingsFor` *replaces* it with a new object instead of changing the old one.

## 5. Fix

Hand out copies of the inner objects too:

```js
export function defaultSettings() {
  return {
    ...DEFAULT_SETTINGS,
    channels: { ...DEFAULT_SETTINGS.channels },
    topics: { ...DEFAULT_SETTINGS.topics },
  };
}
```

`structuredClone(DEFAULT_SETTINGS)` also works, and it keeps working if more nested settings are added later. Fixing this in `settingsFor` alone would leave **Reset to defaults** handing out the shared objects, so the screen could still change them.

## Recognising shared-object mutation bugs

- **Symptom:** data from one account, request or check run turning up in another; bugs that depend on the **order** things happen in, or that a restart or page reload "fixes".
- **Evidence:** a value nobody set here that matches what something *else* set earlier. Log the shared object as `JSON.stringify(...)` before and after a call to watch it change.
- **Usual cause:** a shallow copy (`{ ...obj }`, `Object.assign({}, obj)`, `[...arr]`) of something with nested objects or arrays, followed by changing the nested parts in place.
- **Check:** ask "is this the same object?" with `===`. Copy deep enough for what you change, or build new objects instead of changing old ones.
