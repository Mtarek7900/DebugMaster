// A pretend editor, clock and storage that behave like the real ones.
function pretendEditor() {
  const listeners = [];
  return {
    on(event, listener) {
      if (event === 'change') listeners.push(listener);
    },
    type(text) {
      for (const listener of listeners) listener.call(this, text);
    },
  };
}

function pretendClock() {
  let time = 0;
  const timers = [];
  return {
    now: () => time,
    every(ms, callback) {
      timers.push({ ms, callback, next: ms });
    },
    // Moves time forward, running each interval that comes due.
    async advance(ms) {
      time += ms;
      for (const timer of timers) {
        while (timer.next <= time) {
          timer.next += timer.ms;
          await timer.callback();
        }
      }
    },
  };
}

function pretendStorage() {
  const saved = [];
  return { saved, save: async (text) => void saved.push(text) };
}

check('a new document has no changes yet', () => {
  const autosave = new Autosave(pretendEditor(), pretendStorage(), pretendClock());
  expect(autosave.status()).toBe('No changes yet');
});

check('typing shows "Unsaved changes"', () => {
  const editor = pretendEditor();
  const autosave = new Autosave(editor, pretendStorage(), pretendClock());
  editor.type('Dear Sam,');
  expect(autosave.status()).toBe('Unsaved changes');
});

check('the next interval saves the latest text', async () => {
  const editor = pretendEditor();
  const storage = pretendStorage();
  const clock = pretendClock();
  new Autosave(editor, storage, clock, 3000);
  editor.type('Dear');
  editor.type('Dear Sam,');
  await clock.advance(3000);
  expect(storage.saved).toEqual(['Dear Sam,']);
});

check('nothing is saved when nothing changed', async () => {
  const storage = pretendStorage();
  const clock = pretendClock();
  new Autosave(pretendEditor(), storage, clock, 3000);
  await clock.advance(9000);
  expect(storage.saved).toEqual([]);
});
