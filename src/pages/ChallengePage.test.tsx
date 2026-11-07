// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditorView } from 'codemirror';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Challenge } from '../catalog/challenge';
import { createProgressStore, type ProgressStore } from '../progress/progressStore';
import type { CheckResult, Runner, RunResult } from '../runner/runner';
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

    expect(screen.getByRole('status').textContent).not.toMatch(/Solved/);
    expect(screen.getByText('Revealed')).toBeTruthy();
  });
});

describe('ChallengePage Hints', () => {
  let progress: ProgressStore;
  beforeEach(() => {
    progress = createProgressStore();
  });

  function revealedHints() {
    const list = screen.queryByRole('list', { name: 'Revealed Hints' });
    return list ? within(list).getAllByRole('listitem').map((item) => item.textContent) : [];
  }

  it('reveals Hints one at a time, in order, keeping earlier ones visible', async () => {
    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);
    expect(revealedHints()).toEqual([]);

    await userEvent.click(screen.getByRole('button', { name: 'Reveal next Hint' }));
    expect(revealedHints()).toEqual([expect.stringContaining('Reproduce')]);

    await userEvent.click(screen.getByRole('button', { name: 'Reveal next Hint' }));
    const [first, second] = revealedHints();
    expect(first).toContain('Reproduce');
    expect(first).toContain('a');
    expect(second).toContain('Read the evidence');
    expect(second).toContain('b');
  });

  it('shows how many Hints remain and disables the control once all are revealed', async () => {
    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);
    const reveal = screen.getByRole('button', { name: 'Reveal next Hint' }) as HTMLButtonElement;
    expect(screen.getByText('3 Hints remaining')).toBeTruthy();

    await userEvent.click(reveal);
    expect(screen.getByText('2 Hints remaining')).toBeTruthy();
    await userEvent.click(reveal);
    expect(screen.getByText('1 Hint remaining')).toBeTruthy();
    expect(reveal.disabled).toBe(false);
    await userEvent.click(reveal);

    expect(screen.getByText('No Hints remaining')).toBeTruthy();
    expect(reveal.disabled).toBe(true);
    expect(revealedHints()).toHaveLength(3);
  });

  it('remembers how many Hints were revealed after the page is reopened', async () => {
    const first = render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);
    await userEvent.click(screen.getByRole('button', { name: 'Reveal next Hint' }));
    await userEvent.click(screen.getByRole('button', { name: 'Reveal next Hint' }));
    first.unmount();

    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={createProgressStore()} />);

    expect(revealedHints()).toHaveLength(2);
    expect(screen.getByText('1 Hint remaining')).toBeTruthy();
  });

  it('keeps revealed Hints for the session when browser storage throws', async () => {
    const blocked = () => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked);
    const first = render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);
    await userEvent.click(screen.getByRole('button', { name: 'Reveal next Hint' }));
    first.unmount();

    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);

    expect(revealedHints()).toHaveLength(1);
  });

  it('says the Challenge was Solved with no Hints when none were revealed', async () => {
    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect((await screen.findByRole('status')).textContent).toContain('Solved with no Hints');
  });

  it('states how many Hints were used in the success message', async () => {
    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);
    await userEvent.click(screen.getByRole('button', { name: 'Reveal next Hint' }));
    await userEvent.click(screen.getByRole('button', { name: 'Reveal next Hint' }));

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect((await screen.findByRole('status')).textContent).toContain('Solved with 2 Hints');
  });

  it('says "1 Hint" when exactly one Hint was used', async () => {
    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);
    await userEvent.click(screen.getByRole('button', { name: 'Reveal next Hint' }));

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect((await screen.findByRole('status')).textContent).toContain('Solved with 1 Hint.');
  });

  it('keeps the Hint count of the solve in the success message when more Hints are revealed afterwards', async () => {
    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);
    await userEvent.click(screen.getByRole('button', { name: 'Reveal next Hint' }));
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await screen.findByRole('status');

    await userEvent.click(screen.getByRole('button', { name: 'Reveal next Hint' }));

    expect(screen.getByRole('status').textContent).toContain('Solved with 1 Hint.');
    expect(revealedHints()).toHaveLength(2);
  });

  it('never counts more Hints revealed than the Challenge has', async () => {
    for (let i = 0; i < 5; i++) progress.recordHintRevealed(challenge.id, challenge.hints.length);
    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect((await screen.findByRole('status')).textContent).toContain('Solved with 3 Hints');
    expect(progress.get(challenge.id).hintsRevealed).toBe(3);
  });
});

describe('ChallengePage Give Up', () => {
  let progress: ProgressStore;
  beforeEach(() => {
    progress = createProgressStore();
  });

  async function giveUp() {
    await userEvent.click(screen.getByRole('button', { name: 'Give Up' }));
    const confirmation = screen.getByRole('alertdialog', { name: 'Give up?' });
    await userEvent.click(within(confirmation).getByRole('button', { name: 'Give up and show the Walkthrough' }));
  }

  it('asks for confirmation, and cancelling changes nothing', async () => {
    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);

    await userEvent.click(screen.getByRole('button', { name: 'Give Up' }));
    const confirmation = screen.getByRole('alertdialog', { name: 'Give up?' });
    expect(confirmation.textContent).toMatch(/Revealed/);
    await userEvent.click(within(confirmation).getByRole('button', { name: 'Keep trying' }));

    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(screen.queryByRole('region', { name: 'Walkthrough' })).toBeNull();
    expect(screen.queryByText('Revealed')).toBeNull();
    expect(progress.get(challenge.id).status).toBe('unattempted');
    expect(screen.getByRole('button', { name: 'Give Up' })).toBeTruthy();
  });

  it('confirming opens the Walkthrough and marks the Challenge Revealed', async () => {
    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);

    await giveUp();

    expect(screen.getByRole('region', { name: 'Walkthrough' }).textContent).toContain('Walkthrough text');
    expect(screen.getByText('Revealed')).toBeTruthy();
    expect(progress.get(challenge.id).status).toBe('revealed');
    expect(screen.queryByRole('button', { name: 'Give Up' })).toBeNull();
  });

  it('still runs and submits after Give Up; a fully passing Submit says so but the Challenge stays Revealed', async () => {
    const runner = vi.fn(passingSubmit);
    render(<ChallengePage challenge={challenge} runner={runner} progress={progress} />);
    await giveUp();

    await userEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(await screen.findByText('1 of 1 checks passed')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(runner).toHaveBeenLastCalledWith(challenge, challenge.brokenCode, 'submit');
    const message = (await screen.findByRole('status')).textContent;
    expect(message).toContain('passes every Visible and Hidden Check');
    expect(message).toContain('stays Revealed');
    expect(message).not.toMatch(/Solved with/);
    expect(screen.queryByText('Solved')).toBeNull();
    expect(screen.getByText('Revealed')).toBeTruthy();
    expect(progress.get(challenge.id).status).toBe('revealed');
  });

  it('keeps the Challenge Revealed, with the Walkthrough open, after a reload', async () => {
    const first = render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);
    await giveUp();
    first.unmount();

    // A new store reads only what the browser kept, as after a reload.
    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={createProgressStore()} />);

    expect(screen.getByText('Revealed')).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Walkthrough' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Give Up' })).toBeNull();
  });

  it('does not offer Give Up once the Challenge is Solved', async () => {
    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);
    expect(screen.getByRole('button', { name: 'Give Up' })).toBeTruthy();

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await screen.findByRole('status');

    expect(screen.queryByRole('button', { name: 'Give Up' })).toBeNull();
  });

  it('marks the Challenge Revealed for the session when browser storage throws', async () => {
    const blocked = () => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked);
    const first = render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);
    await giveUp();
    expect(screen.getByRole('region', { name: 'Walkthrough' })).toBeTruthy();
    first.unmount();

    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);

    expect(screen.getByText('Revealed')).toBeTruthy();
  });
});

describe('ChallengePage autosave and Reset', () => {
  let progress: ProgressStore;
  beforeEach(() => {
    progress = createProgressStore();
  });

  async function reset() {
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    const confirmation = screen.getByRole('alertdialog', { name: 'Reset your code?' });
    await userEvent.click(within(confirmation).getByRole('button', { name: 'Reset to the Broken Code' }));
  }

  function editor() {
    return EditorView.findFromDOM(screen.getByRole('textbox', { name: 'Code editor' }))!;
  }

  /** Replaces the editor's whole document, as if the Learner had retyped it. */
  function typeCode(code: string) {
    const view = editor();
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: code } });
  }

  it('restores the edited code when the page is reopened', async () => {
    const first = render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);
    typeCode('export function total(items) { return 42; }\n');
    first.unmount();

    const runner = vi.fn(passingSubmit);
    render(<ChallengePage challenge={challenge} runner={runner} progress={progress} />);

    expect(editor().state.doc.toString()).toBe('export function total(items) { return 42; }\n');
    await userEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(runner).toHaveBeenCalledWith(challenge, 'export function total(items) { return 42; }\n', 'run');
  });

  it('saves the code while the Learner types, so a reload restores it', async () => {
    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);
    typeCode('// work in progress\n');

    // A reload never unmounts the page: only what was already saved survives.
    await waitFor(() => expect(createProgressStore().getCode(challenge.id)).toBe('// work in progress\n'));
    cleanup();
    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={createProgressStore()} />);

    expect(editor().state.doc.toString()).toBe('// work in progress\n');
  });

  it('saves the last keystrokes straight away when the page is being left', () => {
    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);
    typeCode('// typed just before reloading\n');

    window.dispatchEvent(new Event('pagehide'));

    expect(createProgressStore().getCode(challenge.id)).toBe('// typed just before reloading\n');
  });

  it('Reset asks for confirmation, and cancelling keeps the edited code', async () => {
    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);
    typeCode('// my attempt\n');

    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    const confirmation = screen.getByRole('alertdialog', { name: 'Reset your code?' });
    expect(confirmation.textContent).toMatch(/Broken Code/);
    await userEvent.click(within(confirmation).getByRole('button', { name: 'Keep my code' }));

    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(editor().state.doc.toString()).toBe('// my attempt\n');
  });

  it('confirming Reset restores the Broken Code, also after the page is reopened', async () => {
    const runner = vi.fn(passingSubmit);
    const first = render(<ChallengePage challenge={challenge} runner={runner} progress={progress} />);
    typeCode('// my attempt\n');

    await reset();

    expect(editor().state.doc.toString()).toBe(challenge.brokenCode);
    await userEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(runner).toHaveBeenLastCalledWith(challenge, challenge.brokenCode, 'run');
    first.unmount();

    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={createProgressStore()} />);
    expect(editor().state.doc.toString()).toBe(challenge.brokenCode);
  });

  it('cannot confirm Reset while a run is in progress', async () => {
    let finish!: () => void;
    const runner: Runner = vi.fn(
      (c, code, mode) => new Promise<RunResult>((resolve) => (finish = () => resolve(passingSubmit(c, code, mode)))),
    );
    render(<ChallengePage challenge={challenge} runner={runner} progress={progress} />);
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));

    await userEvent.click(screen.getByRole('button', { name: 'Run' }));

    const confirm = screen.getByRole('button', { name: 'Reset to the Broken Code' }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
    finish();
    await screen.findByRole('list', { name: 'Check results' });
    expect(confirm.disabled).toBe(false);
  });

  it('Reset leaves the status and Hint count unchanged', async () => {
    const first = render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);
    await userEvent.click(screen.getByRole('button', { name: 'Reveal next Hint' }));
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await screen.findByRole('status');
    typeCode('// trying another fix\n');

    await reset();

    expect(screen.getByText('Solved')).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Walkthrough' })).toBeTruthy();
    expect(screen.getByText('2 Hints remaining')).toBeTruthy();
    first.unmount();

    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={createProgressStore()} />);
    expect(screen.getByText('Solved')).toBeTruthy();
    expect(screen.getByText('2 Hints remaining')).toBeTruthy();
  });

  it('keeps a Revealed Challenge Revealed through Reset', async () => {
    localStorage.setItem('debugmaster:progress:cart-total', JSON.stringify({ status: 'revealed', hintsRevealed: 3 }));
    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={progress} />);
    typeCode('// after giving up\n');

    await reset();

    expect(screen.getByText('Revealed')).toBeTruthy();
    expect(screen.getByText('No Hints remaining')).toBeTruthy();
    expect(progress.get(challenge.id)).toEqual({ status: 'revealed', hintsRevealed: 3, hintsUsed: null });
  });

  it('keeps edits and Reset working for the session when browser storage throws', async () => {
    const blocked = () => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked);
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(blocked);
    const runner = vi.fn(passingSubmit);
    const first = render(<ChallengePage challenge={challenge} runner={runner} progress={progress} />);
    typeCode('// edited offline\n');
    await userEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(runner).toHaveBeenLastCalledWith(challenge, '// edited offline\n', 'run');
    first.unmount();

    const second = render(<ChallengePage challenge={challenge} runner={runner} progress={progress} />);
    expect(editor().state.doc.toString()).toBe('// edited offline\n');
    await reset();
    expect(editor().state.doc.toString()).toBe(challenge.brokenCode);
    second.unmount();

    render(<ChallengePage challenge={challenge} runner={runner} progress={progress} />);
    expect(editor().state.doc.toString()).toBe(challenge.brokenCode);
  });
});

describe('ChallengePage navigation', () => {
  const next: Challenge = { ...challenge, id: 'price-format', title: 'Prices show too many decimals' };

  it('links back to the Challenge list', () => {
    render(<ChallengePage challenge={challenge} runner={vi.fn()} progress={createProgressStore()} />);

    expect(screen.getByRole('link', { name: /Back to Challenges/ }).getAttribute('href')).toBe('#/');
  });

  it('keeps the filters the Challenge was opened under in its links', async () => {
    render(
      <ChallengePage
        challenge={challenge}
        runner={passingSubmit}
        progress={createProgressStore()}
        nextChallenge={next}
        filters={{ bugCategory: 'off-by-one' }}
      />,
    );

    expect(screen.getByRole('link', { name: /Back to Challenges/ }).getAttribute('href')).toBe('#/?category=off-by-one');
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect((await screen.findByRole('link', { name: /Next Challenge/ })).getAttribute('href')).toBe(
      '#/challenges/price-format?category=off-by-one',
    );
  });

  it('offers the Next Challenge once Solved', async () => {
    render(
      <ChallengePage challenge={challenge} runner={passingSubmit} progress={createProgressStore()} nextChallenge={next} />,
    );
    expect(screen.queryByRole('link', { name: /Next Challenge/ })).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    const link = await screen.findByRole('link', { name: /Next Challenge/ });
    expect(link.getAttribute('href')).toBe('#/challenges/price-format');
    expect(link.textContent).toContain('Prices show too many decimals');
  });

  it('offers the Next Challenge once Revealed', async () => {
    render(<ChallengePage challenge={challenge} runner={vi.fn()} progress={createProgressStore()} nextChallenge={next} />);

    await userEvent.click(screen.getByRole('button', { name: 'Give Up' }));
    const confirmation = screen.getByRole('alertdialog', { name: 'Give up?' });
    await userEvent.click(within(confirmation).getByRole('button', { name: 'Give up and show the Walkthrough' }));

    const link = screen.getByRole('link', { name: /Next Challenge/ });
    expect(link.getAttribute('href')).toBe('#/challenges/price-format');
  });

  it('offers no Next Challenge on the last Challenge', async () => {
    render(<ChallengePage challenge={challenge} runner={passingSubmit} progress={createProgressStore()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await screen.findByRole('status');
    expect(screen.queryByRole('link', { name: /Next Challenge/ })).toBeNull();
  });
});
