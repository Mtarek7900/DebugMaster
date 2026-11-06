/**
 * The Progress Store: each Challenge's progress, kept in the browser's
 * localStorage so it survives a reload without an account.
 *
 * Every storage access fails gracefully. When storage is unavailable (private
 * mode, blocked site data, a full quota), progress is kept in memory for the
 * rest of the session instead, and the site keeps working.
 *
 * Each Challenge keeps its status and how many Hints were revealed.
 * Rules: Solved is recorded only when the status is not already Revealed;
 * Revealed is permanent once set; the Hint count never exceeds the Challenge's Hints.
 */

export type ChallengeStatus = 'unattempted' | 'solved' | 'revealed';

export interface ChallengeProgress {
  status: ChallengeStatus;
  /** How many Hints, counted from the first, the Learner has revealed. */
  hintsRevealed: number;
}

export interface ProgressStore {
  get(challengeId: string): ChallengeProgress;
  /** Call when a Submit passed every check. Leaves a Revealed Challenge Revealed; returns the progress afterwards. */
  recordSolved(challengeId: string): ChallengeProgress;
  /** Call when the Learner reveals their next Hint; never counts past `hintCount`. Returns the progress afterwards. */
  recordHintRevealed(challengeId: string, hintCount: number): ChallengeProgress;
}

const KEY_PREFIX = 'debugmaster:progress:';
const STATUSES: readonly ChallengeStatus[] = ['unattempted', 'solved', 'revealed'];
const UNATTEMPTED: ChallengeProgress = { status: 'unattempted', hintsRevealed: 0 };

export function createProgressStore(): ProgressStore {
  /** Progress that storage could not keep; it wins over storage for the rest of the session. */
  const unsaved = new Map<string, ChallengeProgress>();

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

  return {
    get,
    recordSolved(challengeId) {
      const current = get(challengeId);
      if (current.status === 'revealed') return current;
      const next: ChallengeProgress = { ...current, status: 'solved' };
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
