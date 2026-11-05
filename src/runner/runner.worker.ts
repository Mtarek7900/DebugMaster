/// <reference lib="webworker" />
/** Web Worker entry: runs the Challenge Runner core off the main thread. */
import { runChallenge, type RunMode, type RunnableChallenge } from './runChallenge';

export interface RunRequest {
  challenge: RunnableChallenge;
  code: string;
  mode: RunMode;
}

self.onmessage = async (event: MessageEvent<RunRequest>) => {
  const { challenge, code, mode } = event.data;
  self.postMessage(await runChallenge(challenge, code, mode));
};
