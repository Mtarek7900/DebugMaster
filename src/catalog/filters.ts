/**
 * The Challenge List's filters: a Difficulty, a Bug Category, both or neither.
 * A filter left out means All.
 */
import { BUG_CATEGORIES, DIFFICULTIES, type BugCategory, type Challenge, type Difficulty } from './challenge';

export interface ChallengeFilters {
  difficulty?: Difficulty;
  bugCategory?: BugCategory;
}

export function matchesFilters(challenge: Challenge, filters: ChallengeFilters): boolean {
  return (
    (!filters.difficulty || challenge.difficulty === filters.difficulty) &&
    (!filters.bugCategory || challenge.bugCategory === filters.bugCategory)
  );
}

/**
 * The Challenge after `currentId` in `challenges` (in list order) that matches the filters, or undefined
 * at the end. Counted from the current Challenge's place even when it does not match the filters itself.
 */
export function nextChallenge(
  challenges: Challenge[],
  currentId: string,
  filters: ChallengeFilters,
): Challenge | undefined {
  const index = challenges.findIndex((challenge) => challenge.id === currentId);
  return challenges.slice(index + 1).find((challenge) => matchesFilters(challenge, filters));
}

/** Reads filter values from untrusted text (a URL, a form control); anything unknown means All. */
export function toFilters(values: { difficulty?: string | null; bugCategory?: string | null }): ChallengeFilters {
  const filters: ChallengeFilters = {};
  if (DIFFICULTIES.includes(values.difficulty as Difficulty)) filters.difficulty = values.difficulty as Difficulty;
  if (Object.hasOwn(BUG_CATEGORIES, values.bugCategory ?? '')) filters.bugCategory = values.bugCategory as BugCategory;
  return filters;
}
