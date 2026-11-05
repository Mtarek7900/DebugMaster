/** Node worker-thread entry for tests: the counterpart of the browser's `runner.worker.ts`. */
import { parentPort } from 'node:worker_threads';
import { reportCrash, serveRun, type RunRequest, type WorkerMessage } from '../workerProtocol';

const post = (message: WorkerMessage) => parentPort!.postMessage(message);

parentPort!.on('message', (request: RunRequest) => {
  void serveRun(request, post);
});
process.on('uncaughtException', (error) => reportCrash(error, post));
process.on('unhandledRejection', (reason) => reportCrash(reason, post));
