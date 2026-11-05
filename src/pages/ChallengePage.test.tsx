// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Challenge } from '../catalog/challenge';
import { createProgressStore, type ProgressStore } from '../progress/progressStore';
import type { CheckResult, Runner } from '../runner/runner';
import { ChallengePage } from './ChallengePage';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
});

const challenge: Challenge = {
  id: 'cart-total',
  title: 'Cart total is wrong',
  difficulty: 'easy',
  bugCategory: 'off-by-one',
  bugReport: 'The cart total **skips** the last item.',
  brokenCode: 'export function total(items) {\n  return 0;\n}\n',
  referenceFix: 'export function total(items) {\n  return 1;\n}\n',
  visibleChecks: "check('sums items', () => {})",
  hiddenChecks: "check('hidden one', () => {})",
  hints: [
    { step: 'Reproduce', body: 'a' },
    { step: 'Read the evidence', body: 'b' },
    { step: 'Fix', body: 'c' },
  ],
  walkthrough: 'Walkthrough text',
};

describe('ChallengePage', () => {
  it('shows the Bug Report, Difficulty, Bug Category and the Broken Code', () => {
    render(<ChallengePage challenge={challenge} runner={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Cart total is wrong' })).toBeTruthy();
    expect(screen.getByText('skips').tagName).toBe('STRONG');
    expect(screen.getByText('Easy')).toBeTruthy();
    expect(screen.getByText('Off-by-one')).toBeTruthy();
    expect(screen.getByRole('textbox', { name: 'Code editor' }).textContent).toContain('export function total(items)');
  });

  it("Run runs the Learner's code in run mode and shows each Visible Check's result", async () => {
    const runner: Runner = vi.fn(async () => ({
      outcome: 'completed' as const,
      checks: [
        { name: 'sums two items', kind: 'visible' as const, passed: false, message: 'Expected values to be identical', expected: '30', actual: '10' },
        { name: 'empty cart is 0', kind: 'visible' as const, passed: true },
      ],
      console: [],
    }));
    render(<ChallengePage challenge={challenge} runner={runner} />);

    await userEvent.click(screen.getByRole('button', { name: 'Run' }));

    expect(runner).toHaveBeenCalledWith(challenge, challenge.brokenCode, 'run');
    const results = await screen.findByRole('list', { name: 'Check results' });
    const [failed, passed] = within(results).getAllByRole('listitem');
    expect(failed.textContent).toContain('sums two items');
    expect(failed.textContent).toContain('Failed');
    expect(within(failed).getByText('30')).toBeTruthy();
    expect(within(failed).getByText('10')).toBeTruthy();
    expect(passed.textContent).toContain('empty cart is 0');
    expect(passed.textContent).toContain('Passed');
    expect(screen.getByText('1 of 2 checks passed')).toBeTruthy();
  });

  it('Run shows the console output of the run, in order', async () => {
    const runner: Runner = vi.fn(async () => ({
      outcome: 'completed' as const,
      checks: [{ name: 'sums items', kind: 'visible' as const, passed: true }],
      console: [
        { level: 'log' as const, text: 'items [{ price: 10 }, { price: 20 }]' },
        { level: 'warn' as const, text: 'total is 10' },
      ],
    }));
    render(<ChallengePage challenge={challenge} runner={runner} />);

    await userEvent.click(screen.getByRole('button', { name: 'Run' }));

    const consolePanel = await screen.findByRole('log', { name: 'Console' });
    const lines = within(consolePanel).getAllByRole('listitem').map((line) => line.textContent);
    expect(lines).toEqual(['items [{ price: 10 }, { price: 20 }]', 'total is 10']);
  });

  it('says the console is empty when the run logged nothing', async () => {
    const runner: Runner = vi.fn(async () => ({ outcome: 'completed' as const, checks: [], console: [] }));
    render(<ChallengePage challenge={challenge} runner={runner} />);

    await userEvent.click(screen.getByRole('button', { name: 'Run' }));

    const consolePanel = await screen.findByRole('log', { name: 'Console' });
    expect(consolePanel.textContent).toContain('No console output');
  });

  it("shows the error message when the Learner's code throws", async () => {
    const runner: Runner = vi.fn(async () => ({
      outcome: 'threw' as const,
      error: "TypeError: Cannot read properties of undefined (reading 'price')",
      checks: [],
      console: [],
    }));
    render(<ChallengePage challenge={challenge} runner={runner} />);

    await userEvent.click(screen.getByRole('button', { name: 'Run' }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('threw an error');
    expect(alert.textContent).toContain("TypeError: Cannot read properties of undefined (reading 'price')");
  });

  it('says clearly when the run timed out', async () => {
    const runner: Runner = vi.fn(async () => ({ outcome: 'timed-out' as const, checks: [], console: [] }));
    render(<ChallengePage challenge={challenge} runner={runner} />);

    await userEvent.click(screen.getByRole('button', { name: 'Run' }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/timed out/i);
    expect(alert.textContent).toMatch(/infinite loop/i);
  });
});

const passingSubmit: Runner = async (_challenge, _code, mode) => ({
  outcome: 'completed',
  checks: [
    { name: 'sums items', kind: 'visible', passed: true },
    ...(mode === 'submit' ? [{ name: 'hidden one', kind: 'hidden' as const, passed: true }] : []),
  ],
  console: [],
});

describe('ChallengePage Submit', () => {
  // A fresh store per test, so no progress kept in memory leaks from one test into the next.
  let progress: ProgressStore;
  beforeEach(() => {
    progress = createProgressStore();
  });

  it('Submit runs the code in submit mode; when every check passes it shows success and opens the Walkthrough', async () => {
    const runner = vi.fn(passingSubmit);
    render(<ChallengePage challenge={challenge} runner={runner} progress={progress} />);
    expect(screen.queryByRole('region', { name: 'Walkthrough' })).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(runner).toHaveBeenCalledWith(challenge, challenge.brokenCode, 'submit');
    expect((await screen.findByRole('status')).textContent).toMatch(/solved/i);
    expect(screen.getByRole('region', { name: 'Walkthrough' }).textContent).toContain('Walkthrough text');
  });

  it("shows a failed Hidden Check's name and expected/actual values but not its code, and does not solve", async () => {
    const hiddenFailure: CheckResult = {
      name: 'handles negative prices',
      kind: 'hidden',
      passed: false,
      message: 'Expected values to be identical',
      expected: '-5',
      actual: '5',
    };
    const runner: Runner = vi.fn(async () => ({
      outcome: 'completed' as const,
      checks: [{ name: 'sums items', kind: 'visible' as const, passed: true }, hiddenFailure],
      console: [],
    }));
    const secretChallenge = { ...challenge, hiddenChecks: "check('handles negative prices', () => { expect(total([{ price: -5 }])).toBe(-5); })" };
    render(<ChallengePage challenge={secretChallenge} runner={runner} progress={progress} />);

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    const results = await screen.findByRole('list', { name: 'Check results' });
    const hidden = within(results).getAllByRole('listitem')[1];
    expect(hidden.textContent).toContain('handles negative prices');
    expect(hidden.textContent).toContain('Hidden');
    expect(hidden.textContent).toContain('Failed');
    expect(within(hidden).getByText('-5')).toBeTruthy();
    expect(within(hidden).getByText('5')).toBeTruthy();
    expect(document.body.textContent).not.toContain('price: -5');
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('region', { name: 'Walkthrough' })).toBeNull();
  });

  it('keeps the Challenge Solved, with the Walkthrough open, after the page is reopened', async () => {
    const first = render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await screen.findByRole('status');
    first.unmount();

    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);

    expect(screen.getByText('Solved')).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Walkthrough' })).toBeTruthy();
  });

  it('does not count a Run that passes every Visible Check as Solved', async () => {
    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);

    await userEvent.click(screen.getByRole('button', { name: 'Run' }));
    await screen.findByRole('list', { name: 'Check results' });

    expect(screen.queryByText('Solved')).toBeNull();
    expect(screen.queryByRole('region', { name: 'Walkthrough' })).toBeNull();
  });

  it('still runs, submits and shows Solved for the session when browser storage throws', async () => {
    const blocked = () => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked);
    const runner = vi.fn(passingSubmit);
    render(<ChallengePage challenge={challenge} runner={runner} progress={progress} />);
    expect(screen.queryByText('Solved')).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Run' }));
    await screen.findByRole('list', { name: 'Check results' });
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect((await screen.findByRole('status')).textContent).toMatch(/solved/i);
    expect(screen.getByText('Solved')).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Walkthrough' })).toBeTruthy();
  });

  it('works when even reaching browser storage throws', async () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('Access is denied for this document.', 'SecurityError');
    });
    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);
    expect(screen.queryByRole('region', { name: 'Walkthrough' })).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect((await screen.findByRole('status')).textContent).toMatch(/solved/i);
    expect(screen.getByRole('region', { name: 'Walkthrough' })).toBeTruthy();
  });

  it('keeps Solved for the session when storage can be read but not written', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
    });
    const first = render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await screen.findByRole('status');
    first.unmount();

    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);

    expect(screen.getByText('Solved')).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Walkthrough' })).toBeTruthy();
  });

  it('does not announce Solved when a Revealed Challenge passes every check', async () => {
    localStorage.setItem('debugmaster:progress:cart-total', JSON.stringify({ status: 'revealed' }));
    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await screen.findByText('2 of 2 checks passed');

    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByText('Revealed')).toBeTruthy();
  });
});
