/**
 * The Progress Store: each Challenge's progress, kept in the browser's
 * localStorage so it survives a reload without an account.
 *
 * Every storage access fails gracefully. When storage is unavailable (private
 * mode, blocked site data, a full quota), progress is kept in memory for the
 * rest of the session instead, and the site keeps working.
 *
 * Each Challenge keeps its status, how many Hints were revealed, and the
 * Learner's current code (kept apart, since it changes with every keystroke).
 * Rules: Solved is recorded only when the status is not already Revealed;
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
}

export interface ProgressStore {
  get(challengeId: string): ChallengeProgress;
  /** Call when a Submit passed every check. Leaves a Revealed Challenge Revealed; returns the progress afterwards. */
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

/** How many of the Challenge's Hints count as revealed: the stored count, never more than the Challenge has. */
export function hintsRevealedFor(challenge: Pick<Challenge, 'hints'>, progress: ChallengeProgress): number {
  return Math.min(progress.hintsRevealed, challenge.hints.length);
}

const KEY_PREFIX = 'debugmaster:progress:';
const CODE_KEY_PREFIX = 'debugmaster:code:';
const STATUSES: readonly ChallengeStatus[] = ['unattempted', 'solved', 'revealed'];
const UNATTEMPTED: ChallengeProgress = { status: 'unattempted', hintsRevealed: 0 };

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
      if (current.status === 'revealed') return current;
      const next: ChallengeProgress = { ...current, status: 'solved' };
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
  let value: { status?: unknown; hintsRevealed?: unknown } | null;
  try {
    value = JSON.parse(raw);
  } catch {
    return UNATTEMPTED;
  }
  if (typeof value !== 'object' || value === null) return UNATTEMPTED;
  const { status, hintsRevealed } = value;
  return {
    status: STATUSES.includes(status as ChallengeStatus) ? (status as ChallengeStatus) : 'unattempted',
    hintsRevealed: Number.isInteger(hintsRevealed) && (hintsRevealed as number) > 0 ? (hintsRevealed as number) : 0,
  };
}

/** The Progress Store backed by this browser's localStorage. */
export const browserProgressStore = createProgressStore();
