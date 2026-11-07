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

function setUp(save) {
  const editor = pretendEditor();
  const clock = pretendClock();
  const saved = [];
  const storage = { save: save ?? (async (text) => void saved.push(text)) };
  const autosave = new Autosave(editor, storage, clock, 1000);
  return { editor, clock, saved, autosave };
}

check('after saving, the status says all changes are saved', async () => {
  const { editor, clock, saved, autosave } = setUp();
  editor.type('Meeting notes');
  await clock.advance(1000);
  expect(saved).toEqual(['Meeting notes']);
  expect(autosave.status()).toBe('All changes saved');
  expect(autosave.lastSavedAt).toBe(1000);
});

check('each interval saves only what changed since the last save', async () => {
  const { editor, clock, saved } = setUp();
  editor.type('One');
  await clock.advance(1000);
  await clock.advance(1000);
  editor.type('One two');
  editor.type('One two three');
  await clock.advance(1000);
  expect(saved).toEqual(['One', 'One two three']);
});

check('the status says "Saving…" while a save is in progress', async () => {
  let finishSave;
  const { editor, autosave } = setUp(() => new Promise((resolve) => (finishSave = resolve)));
  editor.type('Draft');
  const saving = autosave.flush();
  expect(autosave.status()).toBe('Saving…');
  finishSave();
  expect(await saving).toBe(true);
  expect(autosave.status()).toBe('All changes saved');
});

check('a failed save is tried again on the next interval', async () => {
  const attempts = [];
  const { editor, clock, autosave } = setUp(async (text) => {
    attempts.push(text);
    if (attempts.length === 1) throw new Error('Network error');
  });
  editor.type('Chapter 1');
  await clock.advance(1000);
  expect(autosave.status()).toBe('Unsaved changes');
  await clock.advance(1000);
  expect(attempts).toEqual(['Chapter 1', 'Chapter 1']);
  expect(autosave.status()).toBe('All changes saved');
});

check('two open documents save separately', async () => {
  const first = setUp();
  const second = setUp();
  first.editor.type('Shopping list');
  second.editor.type('Holiday plans');
  await first.clock.advance(1000);
  await second.clock.advance(1000);
  expect([first.saved, second.saved]).toEqual([['Shopping list'], ['Holiday plans']]);
});
