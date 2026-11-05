/**
 * Catalog integrity suite: every Challenge in the catalog must reproduce its bug,
 * be provably solvable by its Reference Fix, and have valid metadata.
 */
import { describe, expect, it } from 'vitest';
import { runChallenge } from '../runner/runChallenge';
import { challenges, validateChallenge } from './catalog';

describe('the Challenge Catalog', () => {
  it('contains at least one Challenge', () => {
    expect(challenges.length).toBeGreaterThan(0);
  });

  it('uses each folder name as a unique Challenge id', () => {
    const ids = challenges.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe.each(challenges.map((c) => [c.id, c] as const))('Challenge "%s"', (_id, challenge) => {
  it('has valid metadata', () => {
    expect(validateChallenge(challenge)).toEqual([]);
  });

  it('Broken Code fails at least one Visible Check', async () => {
    const result = await runChallenge(challenge, challenge.brokenCode, 'run');

    expect(result.outcome).toBe('completed');
    expect(result.checks.length).toBeGreaterThan(0);
    expect(result.checks.some((c) => !c.passed)).toBe(true);
  });

  it('Reference Fix passes every Visible and Hidden Check', async () => {
    const result = await runChallenge(challenge, challenge.referenceFix, 'submit');

    expect(result.outcome).toBe('completed');
    expect(result.checks.some((c) => c.kind === 'hidden')).toBe(true);
    expect(result.checks.filter((c) => !c.passed)).toEqual([]);
  });
});
