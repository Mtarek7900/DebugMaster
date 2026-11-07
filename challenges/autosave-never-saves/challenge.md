---
title: Autosave never saves
difficulty: hard
category: this-binding
---

Writers are losing work in the document editor. Autosave is supposed to save their changes every few seconds, but nothing is ever saved.

The status bar never says **Unsaved changes**. It says **No changes yet** however much is typed, and closing the tab loses everything. There are no errors in the console. The storage service works: the team tested it on its own, and it stores whatever text it is given. A developer stepped through the editor and confirmed it does announce every change to its listeners.

**To reproduce:** press **Run**. The checks use a pretend editor, clock and storage. The clock only moves forward when a check tells it to, so you can watch each autosave interval happen.

`new Autosave(editor, storage, clock, intervalMs)` sets autosave up for one document: it listens for the editor's `'change'` events and saves on every interval. `status()` returns the status bar text. `flush()` saves now if anything changed.
