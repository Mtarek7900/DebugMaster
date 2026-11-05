/**
 * The browser adapter for the Challenge Runner: each run gets a fresh Web Worker,
 * so Learner code never runs on the page's thread and never sees state left over
 * from a previous run.
 */
import type { RunRequest } from './runner.worker';
import type { Runner, RunResult } from './runner';

export const workerRunner: Runner = (challenge, code, mode) =>
  new Promise<RunResult>((resolve) => {
    const worker = new Worker(new URL('./runner.worker.ts', import.meta.url), { type: 'module' });
    const finish = (result: RunResult) => {
      worker.terminate();
      resolve(result);
    };

    worker.onmessage = (event: MessageEvent<RunResult>) => finish(event.data);
    worker.onerror = (event) => {
      event.preventDefault();
      finish({ outcome: 'threw', error: event.message || 'The code runner crashed', checks: [] });
    };

    const request: RunRequest = {
      challenge: { visibleChecks: challenge.visibleChecks, hiddenChecks: challenge.hiddenChecks },
      code,
      mode,
    };
    worker.postMessage(request);
  });
