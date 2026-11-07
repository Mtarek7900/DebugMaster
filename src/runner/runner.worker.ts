/// <reference lib="webworker" />
/** Web Worker entry: runs the Challenge Runner core off the main thread. */
import { reportCrash, serveRun, type RunRequest, type WorkerMessage } from './workerProtocol';

const post = (message: WorkerMessage) => self.postMessage(message);

self.onmessage = (event: MessageEvent<RunRequest>) => {
  void serveRun(event.data, post);
};
self.addEventListener('error', (event) => {
  event.preventDefault();
  reportCrash(event.error ?? event.message, post);
});
self.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
  reportCrash(event.reason, post);
});
