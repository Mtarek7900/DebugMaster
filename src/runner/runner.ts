import type { RunMode, RunnableChallenge, RunResult } from './runChallenge';

export type { CheckResult, ConsoleEntry, ConsoleLevel, RunMode, RunnableChallenge, RunResult } from './runChallenge';

/** How long a run may take before it is stopped and reported as timed out. */
export const TIME_LIMIT_MS = 3000;

/**
 * Runs a Challenge's checks against the Learner's code. Pages depend on this
 * type rather than on the Web Worker, so tests can inject a fake.
 */
export type Runner = (challenge: RunnableChallenge, code: string, mode: RunMode) => Promise<RunResult>;
