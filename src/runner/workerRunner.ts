/** The browser adapter for the Challenge Runner: each run gets a fresh Web Worker with a time limit. */
import { createTimedWorkerRunner } from './timedWorkerRunner';
import type { WorkerMessage } from './workerProtocol';

export const workerRunner = createTimedWorkerRunner(({ onMessage, onError }) => {
  const worker = new Worker(new URL('./runner.worker.ts', import.meta.url), { type: 'module' });
  worker.onmessage = (event: MessageEvent<WorkerMessage>) => onMessage(event.data);
  worker.onerror = (event) => {
    event.preventDefault();
    onError(event.message);
  };
  return worker;
});
