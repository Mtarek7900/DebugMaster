/**
 * The Progress Store: each Challenge's progress, kept in the browser's
 * localStorage so it survives a reload without an account.
 *
 * Every storage access fails gracefully. When storage is unavailable (private
 * mode, blocked site data, a full quota), progress is kept in memory for the
 * rest of the session instead, and the site keeps working.
 *
 * Each Challenge keeps its status, how many Hints were revealed, how many of
 * them had been revealed when it was first Solved, and the Learner's current code (kept apart, since it changes with every keystroke).
 * Rules: Solved is recorded only when the status is not already Revealed, and only the first Solve sets the Hints used;
 * Revealed is recorded only for an unattempted Challenge and is permanent once set; the Hint count never exceeds the Challenge's Hints;
 * saving or clearing code never touches the status or Hint count.
 */

import type { Challenge } from '../catalog/challenge';

export type ChallengeStatus = 'unattempted' | 'solved' | 'revealed';

export const STATUS_LABELS: Record<ChallengeStatus, string> = {
  unattempted: 'Not started',
  solved: 'Solved',
  revealed: 'Revealed',
};

export interface ChallengeProgress {
  status: ChallengeStatus;
  /** How many Hints, counted from the first, the Learner has revealed. */
  hintsRevealed: number;
  /** How many Hints had been revealed at the first Solve; null until Solved. */
  hintsUsed: number | null;
}

export interface ProgressStore {
  get(challengeId: string): ChallengeProgress;
  /**
   * Call when a Submit passed every check. Leaves a Revealed Challenge Revealed, and an already Solved one
   * exactly as it was (so the Hints used stay those of the first Solve); returns the progress afterwards.
   */
  recordSolved(challengeId: string): ChallengeProgress;
  /** Call when the Learner confirms Give Up. Only an unattempted Challenge becomes Revealed; returns the progress afterwards. */
  recordRevealed(challengeId: string): ChallengeProgress;
  /** Call when the Learner reveals their next Hint; never counts past `hintCount`. Returns the progress afterwards. */
  recordHintRevealed(challengeId: string, hintCount: number): ChallengeProgress;
  /** The Learner's saved code for the Challenge, or null when they have none (start from the Broken Code). */
  getCode(challengeId: string): string | null;
  /** Call as the Learner edits; the code replaces any saved before. */
  saveCode(challengeId: string, code: string): void;
  /** Call on Reset: forgets the saved code, so the Challenge opens on its Broken Code again. */
  clearCode(challengeId: string): void;
}

/** How many Hints a Solved Challenge was solved with, never more than the Challenge has; null until Solved. */
export function hintsUsedFor(challenge: Pick<Challenge, 'hints'>, progress: ChallengeProgress): number | null {
  return progress.hintsUsed === null ? null : Math.min(progress.hintsUsed, challenge.hints.length);
}

/** How many of the Challenge's Hints count as revealed: the stored count, never more than the Challenge has. */
export function hintsRevealedFor(challenge: Pick<Challenge, 'hints'>, progress: ChallengeProgress): number {
  return Math.min(progress.hintsRevealed, challenge.hints.length);
}

const KEY_PREFIX = 'debugmaster:progress:';
const CODE_KEY_PREFIX = 'debugmaster:code:';
const STATUSES: readonly ChallengeStatus[] = ['unattempted', 'solved', 'revealed'];
const UNATTEMPTED: ChallengeProgress = { status: 'unattempted', hintsRevealed: 0, hintsUsed: null };

export function createProgressStore(): ProgressStore {
  /** Progress that storage could not keep; it wins over storage for the rest of the session. */
  const unsaved = new Map<string, ChallengeProgress>();
  /** Code that storage could not keep or clear (null: cleared); it wins over storage for the rest of the session. */
  const unsavedCode = new Map<string, string | null>();

  function get(challengeId: string): ChallengeProgress {
    const kept = unsaved.get(challengeId);
    if (kept) return kept;
    try {
      // `localStorage` is read inside the try: merely reaching it can throw when site data is blocked.
      return parse(window.localStorage.getItem(KEY_PREFIX + challengeId));
    } catch {
      return UNATTEMPTED;
    }
  }

  function save(challengeId: string, progress: ChallengeProgress) {
    try {
      window.localStorage.setItem(KEY_PREFIX + challengeId, JSON.stringify(progress));
      unsaved.delete(challengeId);
    } catch {
      // Storage is unavailable or full: progress lasts only for this session.
      unsaved.set(challengeId, progress);
    }
  }

  function writeCode(challengeId: string, code: string | null) {
    try {
      if (code === null) window.localStorage.removeItem(CODE_KEY_PREFIX + challengeId);
      else window.localStorage.setItem(CODE_KEY_PREFIX + challengeId, code);
      unsavedCode.delete(challengeId);
    } catch {
      // Storage is unavailable or full: the code (or its clearing) lasts only for this session.
      unsavedCode.set(challengeId, code);
    }
  }

  return {
    get,
    getCode(challengeId) {
      if (unsavedCode.has(challengeId)) return unsavedCode.get(challengeId)!;
      try {
        // Inside the try, as in `get`: merely reaching `localStorage` can throw.
        return window.localStorage.getItem(CODE_KEY_PREFIX + challengeId);
      } catch {
        return null;
      }
    },
    saveCode(challengeId, code) {
      writeCode(challengeId, code);
    },
    clearCode(challengeId) {
      writeCode(challengeId, null);
    },
    recordSolved(challengeId) {
      const current = get(challengeId);
      if (current.status !== 'unattempted') return current;
      const next: ChallengeProgress = { ...current, status: 'solved', hintsUsed: current.hintsRevealed };
      save(challengeId, next);
      return next;
    },
    recordRevealed(challengeId) {
      const current = get(challengeId);
      // Revealed is permanent, and a Solved Challenge keeps its Solved.
      if (current.status !== 'unattempted') return current;
      const next: ChallengeProgress = { ...current, status: 'revealed' };
      save(challengeId, next);
      return next;
    },
    recordHintRevealed(challengeId, hintCount) {
      const current = get(challengeId);
      if (current.hintsRevealed >= hintCount) return current;
      const next: ChallengeProgress = { ...current, hintsRevealed: current.hintsRevealed + 1 };
      save(challengeId, next);
      return next;
    },
  };
}

/** Reads a stored entry, treating anything missing or malformed as unattempted with no Hints revealed. */
function parse(raw: string | null): ChallengeProgress {
  if (raw === null) return UNATTEMPTED;
  let value: { status?: unknown; hintsRevealed?: unknown; hintsUsed?: unknown } | null;
  try {
    value = JSON.parse(raw);
  } catch {
    return UNATTEMPTED;
  }
  if (typeof value !== 'object' || value === null) return UNATTEMPTED;
  const status = STATUSES.includes(value.status as ChallengeStatus) ? (value.status as ChallengeStatus) : 'unattempted';
  const hintsRevealed = count(value.hintsRevealed) ?? 0;
  // Progress saved before the Hints used were kept falls back to the Hints revealed.
  const hintsUsed = status === 'solved' ? (count(value.hintsUsed) ?? hintsRevealed) : null;
  return { status, hintsRevealed, hintsUsed };
}

/** A stored count: a non-negative integer, or null when missing or malformed. */
function count(value: unknown): number | null {
  return Number.isInteger(value) && (value as number) >= 0 ? (value as number) : null;
}

/** The Progress Store backed by this browser's localStorage. */
export const browserProgressStore = createProgressStore();
