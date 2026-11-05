/**
 * The messages between a Runner adapter and the worker running the Runner core.
 * Console output is streamed as it is written, so it survives a timeout that
 * terminates the worker before the run finishes.
 */
import { describeError, runChallenge, type ConsoleEntry, type RunMode, type RunnableChallenge, type RunResult } from './runChallenge';

export interface RunRequest {
  challenge: RunnableChallenge;
  code: string;
  mode: RunMode;
}

export type WorkerMessage =
  | { type: 'console'; entry: ConsoleEntry }
  | { type: 'result'; result: RunResult }
  /** Code threw outside any check's reach: from a timer callback, or a promise rejection nothing handled. */
  | { type: 'crashed'; error: string };

/** The worker side: runs one request, posting console output as it happens and then the result. */
export async function serveRun(request: RunRequest, post: (message: WorkerMessage) => void) {
  const { challenge, code, mode } = request;
  const result = await runChallenge(challenge, code, mode, {
    onConsole: (entry) => post({ type: 'console', entry }),
  });
  // Console output already went over as it was written; don't send it twice.
  post({ type: 'result', result: { ...result, console: [] } });
}

/** The worker side: reports an uncaught error or unhandled rejection, which ends the run as "threw". */
export function reportCrash(error: unknown, post: (message: WorkerMessage) => void) {
  post({ type: 'crashed', error: describeError(error) });
}
