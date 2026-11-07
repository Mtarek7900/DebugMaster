import { describe, expect, it } from 'vitest';
import { runChallenge } from './runChallenge';

const addChallenge = {
  visibleChecks: `
    check('adds two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });
    check('adding zero changes nothing', () => {
      expect(add(7, 0)).toBe(7);
    });
  `,
  hiddenChecks: `
    check('adds negative numbers', () => {
      expect(add(-2, -3)).toBe(-5);
    });
  `,
};

const brokenAdd = `export function add(a, b) {\n  return a - b;\n}\n`;

describe('runChallenge in run mode', () => {
  it("reports each Visible Check's name and whether it passed", async () => {
    const result = await runChallenge(addChallenge, brokenAdd, 'run');

    expect(result.outcome).toBe('completed');
    expect(result.checks.map((c) => [c.name, c.passed])).toEqual([
      ['adds two positive numbers', false],
      ['adding zero changes nothing', true],
    ]);
  });

  it('never runs Hidden Checks', async () => {
    const result = await runChallenge(addChallenge, brokenAdd, 'run');

    expect(result.checks.every((c) => c.kind === 'visible')).toBe(true);
    expect(result.checks.map((c) => c.name)).not.toContain('adds negative numbers');
  });

  it('reports the expected and actual values of a failed check', async () => {
    const result = await runChallenge(addChallenge, brokenAdd, 'run');

    expect(result.checks[0]).toMatchObject({ passed: false, expected: '5', actual: '-1' });
  });

  it('quotes strings so the Learner can tell "5" from 5', async () => {
    const challenge = {
      visibleChecks: `check('label', () => { expect(label(5)).toBe('5 items'); });`,
      hiddenChecks: '',
    };
    const result = await runChallenge(challenge, 'export const label = (n) => n + " item";', 'run');

    expect(result.checks[0]).toMatchObject({ expected: '"5 items"', actual: '"5 item"' });
  });

  it('compares with toEqual by structure and shows both values readably', async () => {
    const challenge = {
      visibleChecks: `
        check('splits a full name', () => {
          expect(splitName('Ada Lovelace')).toEqual({ first: 'Ada', last: 'Lovelace' });
        });
        check('lists initials', () => {
          expect(initials(['Ada Lovelace', 'Alan Turing'])).toEqual(['AL', 'AT']);
        });
      `,
      hiddenChecks: '',
    };
    const code = `
      export function splitName(full) {
        const [first, last] = full.split(' ');
        return { first, last: first };
      }
      export function initials(names) {
        return names.map((n) => n.split(' ').map((p) => p[0]).join(''));
      }
    `;
    const result = await runChallenge(challenge, code, 'run');

    expect(result.checks[0]).toMatchObject({
      passed: false,
      expected: '{ first: "Ada", last: "Lovelace" }',
      actual: '{ first: "Ada", last: "Ada" }',
    });
    expect(result.checks[1]).toMatchObject({ passed: true });
  });

  it('checks with toThrow that a function throws, optionally with a matching message', async () => {
    const challenge = {
      visibleChecks: `
        check('rejects a negative quantity', () => {
          expect(() => setQuantity(-1)).toThrow('quantity');
        });
        check('rejects a fractional quantity', () => {
          expect(() => setQuantity(1.5)).toThrow();
        });
        check('mentions the field in the error', () => {
          expect(() => setQuantity(-1)).toThrow('must be positive');
        });
      `,
      hiddenChecks: '',
    };
    const code = `
      export function setQuantity(n) {
        if (n < 0) throw new RangeError('quantity cannot be negative');
        return n;
      }
    `;
    const result = await runChallenge(challenge, code, 'run');

    expect(result.checks.map((c) => c.passed)).toEqual([true, false, false]);
    expect(result.checks[1]).toMatchObject({ expected: 'a thrown error', actual: 'returned 1.5' });
    expect(result.checks[2]).toMatchObject({
      expected: 'an error whose message includes "must be positive"',
      actual: 'RangeError: quantity cannot be negative',
    });
  });
});

describe('runChallenge in submit mode', () => {
  it('runs every Visible Check and then every Hidden Check, each marked with its kind', async () => {
    const result = await runChallenge(addChallenge, brokenAdd, 'submit');

    expect(result.outcome).toBe('completed');
    expect(result.checks.map((c) => [c.name, c.kind, c.passed])).toEqual([
      ['adds two positive numbers', 'visible', false],
      ['adding zero changes nothing', 'visible', true],
      ['adds negative numbers', 'hidden', false],
    ]);
  });

  it('reports the expected and actual values of a failed Hidden Check', async () => {
    const result = await runChallenge(addChallenge, brokenAdd, 'submit');

    expect(result.checks[2]).toMatchObject({ kind: 'hidden', passed: false, expected: '-5', actual: '1' });
  });

  it('rejects a fix that hard-codes the Visible Checks', async () => {
    const hardCoded = `export function add(a, b) {
  if (a === 2 && b === 3) return 5;
  return a;
}
`;

    const run = await runChallenge(addChallenge, hardCoded, 'run');
    const submit = await runChallenge(addChallenge, hardCoded, 'submit');

    expect(run.checks.every((c) => c.passed)).toBe(true);
    expect(submit.checks.filter((c) => !c.passed).map((c) => c.name)).toEqual(['adds negative numbers']);
  });

  it('passes every check for a real fix', async () => {
    const result = await runChallenge(addChallenge, 'export const add = (a, b) => a + b;', 'submit');

    expect(result.outcome).toBe('completed');
    expect(result.checks).toHaveLength(3);
    expect(result.checks.every((c) => c.passed)).toBe(true);
  });
});

describe('runChallenge console capture', () => {
  it("captures the Learner's console output in order, with objects and arrays readable", async () => {
    const challenge = {
      visibleChecks: `
        console.log('loading checks');
        check('first', () => { describe({ id: 1, tags: ['a', 'b'] }); });
        check('second', () => { console.warn('careful', 42); });
      `,
      hiddenChecks: '',
    };
    const code = `
      console.log('module loaded');
      export function describe(order) {
        console.log('order is', order, [1, [2, 3]]);
        console.error(new TypeError('bad'));
      }
    `;
    const result = await runChallenge(challenge, code, 'run');

    expect(result.console).toEqual([
      { level: 'log', text: 'module loaded' },
      { level: 'log', text: 'loading checks' },
      { level: 'log', text: 'order is { id: 1, tags: ["a", "b"] } [1, [2, 3]]' },
      { level: 'error', text: 'TypeError: bad' },
      { level: 'warn', text: 'careful 42' },
    ]);
  });
});

describe('runChallenge when code throws', () => {
  it('reports "threw" with the message when the Learner\'s code throws while loading', async () => {
    const challenge = { visibleChecks: `check('anything', () => {});`, hiddenChecks: '' };
    const result = await runChallenge(challenge, `const x = null;\nx.length;\nexport const y = 1;`, 'run');

    expect(result.outcome).toBe('threw');
    expect(result).toMatchObject({ error: expect.stringContaining('TypeError') });
  });

  it('reports "threw" when a check crashes, still listing every check with that check marked failed', async () => {
    const challenge = {
      visibleChecks: `
        check('reads the first item', () => { expect(first(null)).toBe(1); });
        check('still runs later checks', () => { expect(first([1])).toBe(1); });
      `,
      hiddenChecks: '',
    };
    const result = await runChallenge(challenge, `export const first = (items) => items[0];`, 'run');

    expect(result.outcome).toBe('threw');
    expect(result).toMatchObject({ error: expect.stringMatching(/^TypeError: .*null/) });
    expect(result.checks.map((c) => [c.name, c.passed])).toEqual([
      ['reads the first item', false],
      ['still runs later checks', true],
    ]);
  });
});

describe('runChallenge with async code', () => {
  it('awaits async checks, including promises and timers', async () => {
    const challenge = {
      visibleChecks: `
        check('waits for a timer', async () => {
          expect(await delayed(5, 'done')).toBe('done');
        });
        check('fails when the awaited value is wrong', async () => {
          expect(await delayed(1, 'early')).toBe('late');
        });
      `,
      hiddenChecks: '',
    };
    const code = `export const delayed = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));`;
    const result = await runChallenge(challenge, code, 'run');

    expect(result.outcome).toBe('completed');
    expect(result.checks).toMatchObject([
      { name: 'waits for a timer', passed: true },
      { name: 'fails when the awaited value is wrong', passed: false, expected: '"late"', actual: '"early"' },
    ]);
  });

  it('reports a rejected promise like a synchronous throw', async () => {
    const challenge = {
      visibleChecks: `check('loads the user', async () => { await loadUser(); });`,
      hiddenChecks: '',
    };
    const code = `export async function loadUser() { await null; throw new Error('network down'); }`;
    const result = await runChallenge(challenge, code, 'run');

    expect(result).toMatchObject({ outcome: 'threw', error: 'Error: network down' });
    expect(result.checks).toMatchObject([{ name: 'loads the user', passed: false, message: 'Error: network down' }]);
  });
});

describe('runChallenge and Learner code that names its own console', () => {
  it('lets the code declare its own `console` variable', async () => {
    const challenge = { visibleChecks: `check('logs', () => { expect(run()).toBe(1); });`, hiddenChecks: '' };
    const code = `const console = { log() {} };\nexport const run = () => { console.log('hidden'); return 1; };`;
    const result = await runChallenge(challenge, code, 'run');

    expect(result).toMatchObject({ outcome: 'completed', checks: [{ passed: true }], console: [] });
  });
});
