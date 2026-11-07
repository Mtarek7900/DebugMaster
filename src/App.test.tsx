// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import type { BugCategory, Challenge, Difficulty } from './catalog/challenge';
import { createProgressStore, type ProgressStore } from './progress/progressStore';
import type { Runner } from './runner/runner';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
  window.location.hash = '';
});

function makeChallenge(id: string, title: string, difficulty: Difficulty, bugCategory: BugCategory): Challenge {
  return {
    id,
    title,
    difficulty,
    bugCategory,
    bugReport: 'report',
    brokenCode: '',
    referenceFix: '',
    visibleChecks: '',
    hiddenChecks: '',
    hints: [
      { step: 'Reproduce', body: 'a' },
      { step: 'Narrow down', body: 'b' },
      { step: 'Fix', body: 'c' },
    ],
    walkthrough: 'w',
  };
}

// In list order, as the catalog provides them.
const challenges = [
  makeChallenge('cart', 'Cart total is wrong', 'easy', 'off-by-one'),
  makeChallenge('prices', 'Prices add up as text', 'easy', 'type-coercion'),
  makeChallenge('rows', 'Table drops a row', 'medium', 'off-by-one'),
];

const passingSubmit: Runner = async () => ({
  outcome: 'completed',
  checks: [{ name: 'works', kind: 'hidden', passed: true }],
  console: [],
});

function heading() {
  return screen.getByRole('heading', { level: 1 }).textContent;
}

async function solve() {
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await screen.findByRole('status');
}

describe('App', () => {
  let progress: ProgressStore;
  let scrollTo: ReturnType<typeof vi.fn<(x: number, y: number) => void>>;
  beforeEach(() => {
    progress = createProgressStore();
    // jsdom has no layout, so scrolling is only recorded.
    scrollTo = vi.fn<(x: number, y: number) => void>();
    vi.spyOn(window, 'scrollTo').mockImplementation(scrollTo);
  });

  it('opens on the Challenge list', () => {
    render(<App challenges={challenges} runner={passingSubmit} progress={progress} />);

    expect(heading()).toBe('Challenges');
  });

  it('keeps the filters in the URL, through a Challenge and back, with Next following the filtered list', async () => {
    render(<App challenges={challenges} runner={passingSubmit} progress={progress} />);

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Bug Category' }), 'Off-by-one');
    expect(window.location.hash).toBe('#/?category=off-by-one');

    await userEvent.click(screen.getByRole('link', { name: 'Cart total is wrong' }));
    expect(await screen.findByRole('heading', { name: 'Cart total is wrong' })).toBeTruthy();
    expect(scrollTo).toHaveBeenCalledWith(0, 0);

    await solve();
    // Skips the type-coercion Challenge, which the filters leave out.
    await userEvent.click(screen.getByRole('link', { name: /Next Challenge: Table drops a row/ }));
    expect(await screen.findByRole('heading', { name: 'Table drops a row' })).toBeTruthy();

    await solve();
    expect(screen.queryByRole('link', { name: /Next Challenge/ })).toBeNull();

    await userEvent.click(screen.getByRole('link', { name: /Back to Challenges/ }));
    await screen.findByRole('heading', { name: 'Challenges' });
    expect((screen.getByRole('combobox', { name: 'Bug Category' }) as HTMLSelectElement).value).toBe('off-by-one');
    const list = screen.getByRole('list', { name: 'Challenges' });
    expect(within(list).getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Cart total is wrong',
      'Table drops a row',
    ]);
  });

  it('opens a Challenge straight from its URL', () => {
    window.location.hash = '#/challenges/prices';
    render(<App challenges={challenges} runner={passingSubmit} progress={progress} />);

    expect(heading()).toBe('Prices add up as text');
  });

  it('says when no Challenge has the id in the URL', () => {
    window.location.hash = '#/challenges/missing';
    render(<App challenges={challenges} runner={passingSubmit} progress={progress} />);

    expect(heading()).toBe('Challenge not found');
    expect(screen.getByRole('link', { name: 'Browse all Challenges' }).getAttribute('href')).toBe('#/');
  });
});
