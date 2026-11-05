import type { RunMode, RunnableChallenge, RunResult } from './runChallenge';

export type { CheckResult, RunMode, RunnableChallenge, RunResult } from './runChallenge';

/**
 * Runs a Challenge's checks against the Learner's code. Pages depend on this
 * type rather than on the Web Worker, so tests can inject a fake.
 */
export type Runner = (challenge: RunnableChallenge, code: string, mode: RunMode) => Promise<RunResult>;
