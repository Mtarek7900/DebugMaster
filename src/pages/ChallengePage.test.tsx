// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Challenge } from '../catalog/challenge';
import type { Runner } from '../runner/runner';
import { ChallengePage } from './ChallengePage';

afterEach(cleanup);

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
});
