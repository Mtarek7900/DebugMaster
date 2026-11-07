// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { BugCategory, Challenge, Difficulty } from '../catalog/challenge';
import { createProgressStore, type ProgressStore } from '../progress/progressStore';
import { ChallengeListPage } from './ChallengeListPage';

afterEach(() => {
  cleanup();
  localStorage.clear();
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

// Deliberately out of order: the page puts them easy → medium → hard.
const challenges = [
  makeChallenge('race', 'Search results flicker', 'hard', 'async-race'),
  makeChallenge('cart', 'Cart total is wrong', 'easy', 'off-by-one'),
  makeChallenge('prices', 'Prices add up as text', 'medium', 'type-coercion'),
  makeChallenge('pages', 'Last page is missing', 'easy', 'off-by-one'),
];

function entries() {
  return within(screen.getByRole('list', { name: 'Challenges' })).queryAllByRole('listitem');
}

function titles() {
  return entries().map((entry) => within(entry).getByRole('link').textContent);
}

describe('ChallengeListPage', () => {
  let progress: ProgressStore;
  beforeEach(() => {
    progress = createProgressStore();
  });

  it('lists every Challenge from easy to hard, with its Difficulty and Bug Category, linking to its page', () => {
    render(<ChallengeListPage challenges={challenges} progress={progress} />);

    expect(titles()).toEqual([
      'Cart total is wrong',
      'Last page is missing',
      'Prices add up as text',
      'Search results flicker',
    ]);
    const [cart, , prices, race] = entries();
    expect(within(cart).getByText('Easy')).toBeTruthy();
    expect(within(cart).getByText('Off-by-one')).toBeTruthy();
    expect(within(prices).getByText('Medium')).toBeTruthy();
    expect(within(prices).getByText('Type coercion')).toBeTruthy();
    expect(within(race).getByText('Hard')).toBeTruthy();
    expect(within(race).getByText('Async race')).toBeTruthy();
    expect(within(cart).getByRole('link').getAttribute('href')).toBe('#/challenges/cart');
  });

  it('shows each Challenge as Solved, Revealed or Not started, with the Hint count on Solved ones', () => {
    progress.recordHintRevealed('cart', 3);
    progress.recordHintRevealed('cart', 3);
    progress.recordSolved('cart');
    progress.recordSolved('pages');
    progress.recordHintRevealed('prices', 3);
    progress.recordRevealed('prices');
    render(<ChallengeListPage challenges={challenges} progress={progress} />);

    const [cart, pages, prices, race] = entries();
    expect(within(cart).getByText('Solved')).toBeTruthy();
    expect(cart.textContent).toContain('2 Hints');
    expect(within(pages).getByText('Solved')).toBeTruthy();
    expect(pages.textContent).toContain('no Hints');
    expect(within(prices).getByText('Revealed')).toBeTruthy();
    expect(prices.textContent).not.toMatch(/Hint/);
    expect(within(race).getByText('Not started')).toBeTruthy();
    expect(race.textContent).not.toMatch(/Hint/);
  });

  it('filters by Difficulty', async () => {
    render(<ChallengeListPage challenges={challenges} progress={progress} />);

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Difficulty' }), 'Easy');

    expect(titles()).toEqual(['Cart total is wrong', 'Last page is missing']);
  });

  it('filters by Bug Category', async () => {
    render(<ChallengeListPage challenges={challenges} progress={progress} />);

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Bug Category' }), 'Type coercion');

    expect(titles()).toEqual(['Prices add up as text']);
  });

  it('combines the Difficulty and Bug Category filters', async () => {
    const withMediumOffByOne = [...challenges, makeChallenge('rows', 'Table drops a row', 'medium', 'off-by-one')];
    render(<ChallengeListPage challenges={withMediumOffByOne} progress={progress} />);

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Bug Category' }), 'Off-by-one');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Difficulty' }), 'Medium');

    expect(titles()).toEqual(['Table drops a row']);
  });

  it('says so when no Challenge matches the filters', async () => {
    render(<ChallengeListPage challenges={challenges} progress={progress} />);

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Difficulty' }), 'Hard');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Bug Category' }), 'Off-by-one');

    expect(screen.queryByRole('list', { name: 'Challenges' })).toBeNull();
    expect(screen.getByText(/No Challenges match these filters/)).toBeTruthy();
  });
});
