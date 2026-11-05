// Runs the Challenge Runner core in a Node worker thread with a time limit,
// mirroring the browser's Web Worker adapter.
import { beforeAll, describe, expect, it } from 'vitest';
import type { Runner } from './runner';
import { createNodeWorkerRunner } from './testing/nodeWorkerRunner';

const TIME_LIMIT_MS = 1000;
let runner: Runner;

beforeAll(async () => {
  runner = await createNodeWorkerRunner(TIME_LIMIT_MS);
});

const oneCheck = (body: string) => ({ visibleChecks: `check('the check', ${body});`, hiddenChecks: '' });

describe('the Runner time limit', () => {
  it('stops an infinite loop and reports "timed out"', async () => {
    const started = Date.now();
    const result = await runner(oneCheck('() => { spin(); }'), 'export function spin() { while (true) {} }', 'run');

    expect(result.outcome).toBe('timed-out');
    expect(Date.now() - started).toBeLessThan(TIME_LIMIT_MS + 1500);
  });

  it('stops an async check that never settles', async () => {
    const result = await runner(oneCheck('async () => { await new Promise(() => {}); }'), 'export const x = 1;', 'run');

    expect(result.outcome).toBe('timed-out');
  });

  it('keeps the console output written before the time limit', async () => {
    const code = `export function spin() { console.log('starting', { step: 1 }); while (true) {} }`;
    const result = await runner(oneCheck('() => { spin(); }'), code, 'run');

    expect(result.outcome).toBe('timed-out');
    expect(result.console).toEqual([{ level: 'log', text: 'starting { step: 1 }' }]);
  });

  it('runs normally after a timeout, in a fresh worker', async () => {
    await runner(oneCheck('() => { spin(); }'), 'export function spin() { while (true) {} }', 'run');
    const code = `let calls = 0;\nexport function count() { calls += 1; console.log('call', calls); return calls; }`;
    const result = await runner(oneCheck('async () => { expect(count()).toBe(1); }'), code, 'run');

    expect(result).toMatchObject({
      outcome: 'completed',
      checks: [{ name: 'the check', passed: true }],
      console: [{ level: 'log', text: 'call 1' }],
    });
  });
});

describe('errors the checks never await', () => {
  it('reports "threw" when a timer callback throws', async () => {
    const code = `export function later() { setTimeout(() => { throw new RangeError('too late'); }, 0); }`;
    const result = await runner(oneCheck('async () => { later(); await new Promise((r) => setTimeout(r, 50)); }'), code, 'run');

    expect(result).toMatchObject({ outcome: 'threw', error: 'RangeError: too late' });
  });

  it('reports "threw" for a promise rejection nothing handles', async () => {
    const code = `export function save() { Promise.reject(new Error('save failed')); }`;
    const result = await runner(oneCheck('async () => { save(); await new Promise((r) => setTimeout(r, 50)); }'), code, 'run');

    expect(result).toMatchObject({ outcome: 'threw', error: 'Error: save failed' });
  });
});
