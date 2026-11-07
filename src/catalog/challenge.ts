/**
 * The Challenge model and the authoring format that produces it.
 *
 * A Challenge is one folder under `challenges/`, its id being the folder name:
 *
 *   challenge.md       frontmatter (title, difficulty, category) + the Bug Report
 *   broken.js          the Broken Code
 *   fix.js             the Reference Fix (never shown to the Learner)
 *   visible.checks.js  the Visible Checks
 *   hidden.checks.js   the Hidden Checks
 *   hints.md           3–5 Hints in order, each starting with a `## <method step>` heading
 *   walkthrough.md     the Walkthrough
 *
 * broken.js and fix.js expose the same named exports (no `export default`, no
 * `import`). Check files call those exports as plain variables, alongside
 * `check(name, fn)` and `expect(actual)`.
 */

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

/** List order: easy → medium → hard, then by id so the order is stable. */
export function compareChallenges(a: Challenge, b: Challenge): number {
  return DIFFICULTIES.indexOf(a.difficulty) - DIFFICULTIES.indexOf(b.difficulty) || a.id.localeCompare(b.id);
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

export const BUG_CATEGORIES = {
  'off-by-one': 'Off-by-one',
  'type-coercion': 'Type coercion',
  'shared-object-mutation': 'Shared-object mutation',
  'closure-in-loop': 'Closure in a loop',
  'async-race': 'Async race',
  'this-binding': '`this` binding',
} as const;
export type BugCategory = keyof typeof BUG_CATEGORIES;

export interface Hint {
  /** The debugging-method step this Hint teaches, e.g. "Reproduce". */
  step: string;
  /** Markdown. */
  body: string;
}

export interface Challenge {
  id: string;
  title: string;
  difficulty: Difficulty;
  bugCategory: BugCategory;
  /** Markdown. */
  bugReport: string;
  brokenCode: string;
  referenceFix: string;
  visibleChecks: string;
  hiddenChecks: string;
  hints: Hint[];
  /** Markdown. */
  walkthrough: string;
}

export const CHALLENGE_FILES = [
  'challenge.md',
  'broken.js',
  'fix.js',
  'visible.checks.js',
  'hidden.checks.js',
  'hints.md',
  'walkthrough.md',
] as const;

/** Builds a Challenge from the contents of its folder, keyed by file name. */
export function parseChallenge(id: string, files: Record<string, string>): Challenge {
  const missing = CHALLENGE_FILES.filter((name) => files[name] === undefined);
  if (missing.length) {
    throw new Error(`Challenge "${id}" is missing ${missing.join(', ')}`);
  }

  const { data, body } = parseFrontmatter(files['challenge.md']);
  return {
    id,
    title: data.title ?? '',
    difficulty: data.difficulty as Difficulty,
    bugCategory: data.category as BugCategory,
    bugReport: body.trim(),
    brokenCode: files['broken.js'],
    referenceFix: files['fix.js'],
    visibleChecks: files['visible.checks.js'],
    hiddenChecks: files['hidden.checks.js'],
    hints: parseHints(files['hints.md']),
    walkthrough: files['walkthrough.md'].trim(),
  };
}

/** Returns a list of problems with a Challenge's metadata; empty when valid. */
export function validateChallenge(challenge: Challenge): string[] {
  const problems: string[] = [];
  if (!challenge.title.trim()) problems.push('title is empty');
  if (!DIFFICULTIES.includes(challenge.difficulty)) {
    problems.push(`unknown difficulty "${challenge.difficulty}" (expected ${DIFFICULTIES.join(', ')})`);
  }
  if (!Object.hasOwn(BUG_CATEGORIES, challenge.bugCategory ?? '')) {
    problems.push(
      `unknown bug category "${challenge.bugCategory}" (expected ${Object.keys(BUG_CATEGORIES).join(', ')})`,
    );
  }
  if (!challenge.bugReport) problems.push('Bug Report is empty');
  if (!challenge.walkthrough) problems.push('Walkthrough is empty');
  if (challenge.hints.length < 3 || challenge.hints.length > 5) {
    problems.push(`has ${challenge.hints.length} Hints (expected 3–5)`);
  }
  challenge.hints.forEach((hint, i) => {
    if (!hint.body) problems.push(`Hint ${i + 1} ("${hint.step}") is empty`);
  });
  return problems;
}

function parseFrontmatter(text: string): { data: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!match) return { data: {}, body: text };
  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    data[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }
  return { data, body: text.slice(match[0].length) };
}

function parseHints(text: string): Hint[] {
  return text
    .split(/^## /m)
    .slice(1)
    .map((section) => {
      const newline = section.indexOf('\n');
      const step = (newline === -1 ? section : section.slice(0, newline)).trim();
      const body = newline === -1 ? '' : section.slice(newline + 1).trim();
      return { step, body };
    });
}
