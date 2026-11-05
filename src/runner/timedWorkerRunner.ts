/**
 * Runs each Challenge run in a fresh worker and enforces the time limit by
 * terminating it, so an infinite loop never freezes the page and never leaves
 * state behind for the next run. The worker itself (a browser Web Worker or a
 * Node worker thread) is supplied by `spawn`.
 */
import { TIME_LIMIT_MS, type ConsoleEntry, type Runner, type RunResult } from './runner';
import type { RunRequest, WorkerMessage } from './workerProtocol';

export interface WorkerHandlers {
  onMessage(message: WorkerMessage): void;
  /** The worker itself failed, for example its script could not load. */
  onError(message: string): void;
}

export interface RunnerWorker {
  postMessage(request: RunRequest): void;
  terminate(): void;
}

export function createTimedWorkerRunner(
  spawn: (handlers: WorkerHandlers) => RunnerWorker,
  timeLimitMs = TIME_LIMIT_MS,
): Runner {
  return (challenge, code, mode) =>
    new Promise<RunResult>((resolve) => {
      const consoleEntries: ConsoleEntry[] = [];
      let finished = false;
      const finish = (result: RunResult) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        worker.terminate();
        resolve(result);
      };

      const crashed = (error: string) =>
        finish({ outcome: 'threw', error: error || 'The code runner crashed', checks: [], console: consoleEntries });

      const worker = spawn({
        onMessage(message) {
          if (message.type === 'console') consoleEntries.push(message.entry);
          else if (message.type === 'crashed') crashed(message.error);
          else finish({ ...message.result, console: consoleEntries });
        },
        onError: crashed,
      });
      const timer = setTimeout(() => finish({ outcome: 'timed-out', checks: [], console: consoleEntries }), timeLimitMs);

      worker.postMessage({
        // Only the fields the core needs: a whole Challenge (with its Walkthrough) need not cross over.
        challenge: { visibleChecks: challenge.visibleChecks, hiddenChecks: challenge.hiddenChecks },
        code,
        mode,
      });
    });
}
