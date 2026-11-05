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
