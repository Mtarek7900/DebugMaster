## 1. Reproduce

Running the checks shows two failures. In "a slow answer for older text does not replace newer results", the box says `laptop` but shows `['laptop', 'laptop stand', 'lapel pin']`, the results for `lap`. In "the box keeps loading until the newest search answers", loading is `false` while the newest search is still waiting.

The check "answers in order show the results for the newest text" makes the same two searches and passes. The only difference is the **order the answers arrive in**. That's the mark of a race: the result depends on timing, not just on the inputs. It also explains the Bug Report: typing slowly means each answer arrives before the next search starts, and slow mobile data lets answers overtake each other.

## 2. Read the evidence

When answers arrive out of order, the *last answer to arrive* wins, even if it's for older text. The loading check shows the same thing from the other side: the first answer to arrive turns the spinner off, even though it isn't the newest search. Every answer is treated as the newest one.

The search service isn't at fault. The Bug Report says it returns the right results for each query, and the pretend service in the checks does too.

## 3. Narrow down

The code has a guard that's supposed to drop out-of-date answers:

```js
const thisSearch = searchCount;
if (thisSearch !== searchCount) {
  return;
}
```

Logging both values for the late `lap` answer prints `2 2`. They are always equal, so the guard never fires.

## 4. Form a theory

`type` is an `async` function. At `await searchProducts(query)` it pauses, and other code runs before it continues: here, the next keystroke calls `type('laptop')`, which adds 1 to `searchCount`. When the `lap` answer finally arrives, `type('lap')` carries on from the `await`:

```text
type('lap')     searchCount = 1, waits…
type('laptop')  searchCount = 2, waits…
'laptop' answer: thisSearch = 2, searchCount = 2 → shown ✓
'lap' answer:    thisSearch = 2, searchCount = 2 → shown ✗ (should be dropped)
```

`thisSearch` is meant to remember *which search this call started*. But it's read **after** the `await`, so it gets whatever the latest number is by then, which by definition is the same as `searchCount`. To remember the search a call started, you have to read the number **before** the call waits.

## 5. Fix

Take the snapshot right after starting the search, before the `await`:

```js
searchCount += 1;
const thisSearch = searchCount;
// … await searchProducts(query) …
if (thisSearch !== searchCount) {
  return; // a newer search has started: drop this answer
}
```

Now the late `lap` answer has `thisSearch = 1` and `searchCount = 2`, so it's dropped. That covers results, the spinner and errors alike, because they're all set after the guard. Clearing the box adds 1 too, so an answer still on its way after the box is cleared is dropped as well. Comparing the answer's query with what is in the box now (`state.query.trim() !== query`) also works here. An `AbortController` that cancels the old request would work too, if the search service supported it.

## Recognising async race bugs

- **Symptom:** the result depends on **timing**: fine when slow or in order, wrong when fast, on a slow network, or under load. Out-of-date data appears, or a spinner turns off too early.
- **Evidence:** the same inputs give different results when the order of answers changes. Reproduce it by controlling that order (pretend services, fake timers) instead of hoping it happens.
- **Usual cause:** code after an `await` assumes the world hasn't changed while it waited, often by reading shared state after the `await` instead of before it.
- **Check:** for every `await`, ask "what could change while this waits?" Capture what the call needs to remember *before* it waits, and check that it still holds afterwards.
