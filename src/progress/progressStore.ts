/**
 * The Progress Store: each Challenge's progress, kept in the browser's
 * localStorage so it survives a reload without an account.
 *
 * Every storage access fails gracefully. When storage is unavailable (private
 * mode, blocked site data, a full quota), progress is kept in memory for the
 * rest of the session instead, and the site keeps working.
 *
 * Rules: Solved is recorded only when the status is not already Revealed;
 * Revealed is permanent once set.
 */

export type ChallengeStatus = 'unattempted' | 'solved' | 'revealed';

export interface ChallengeProgress {
  status: ChallengeStatus;
}

export interface ProgressStore {
  get(challengeId: string): ChallengeProgress;
  /** Call when a Submit passed every check. Leaves a Revealed Challenge Revealed; returns the progress afterwards. */
  recordSolved(challengeId: string): ChallengeProgress;
}

const KEY_PREFIX = 'debugmaster:progress:';
const STATUSES: readonly ChallengeStatus[] = ['unattempted', 'solved', 'revealed'];
const UNATTEMPTED: ChallengeProgress = { status: 'unattempted' };

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
  };
}

/** Reads a stored entry, treating anything missing or malformed as unattempted. */
function parse(raw: string | null): ChallengeProgress {
  if (raw === null) return UNATTEMPTED;
  try {
    const value: unknown = JSON.parse(raw);
    const status = (value as { status?: unknown } | null)?.status;
    return STATUSES.includes(status as ChallengeStatus) ? { status: status as ChallengeStatus } : UNATTEMPTED;
  } catch {
    return UNATTEMPTED;
  }
}

/** The Progress Store backed by this browser's localStorage. */
export const browserProgressStore = createProgressStore();
