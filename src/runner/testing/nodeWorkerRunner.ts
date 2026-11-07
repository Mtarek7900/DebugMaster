/**
 * A Runner for Node tests that mirrors the browser adapter: the Runner core runs
 * in a worker thread (bundled with esbuild, since Node cannot load the
 * TypeScript sources directly) under the same time limit logic.
 */
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import type { Runner } from '../runner';
import { createTimedWorkerRunner } from '../timedWorkerRunner';

export async function createNodeWorkerRunner(timeLimitMs?: number): Promise<Runner> {
  const bundle = await build({
    entryPoints: [fileURLToPath(new URL('./nodeRunner.worker.ts', import.meta.url))],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    write: false,
  });
  const source = bundle.outputFiles[0].text;

  return createTimedWorkerRunner(({ onMessage, onError }) => {
    const worker = new Worker(source, { eval: true });
    worker.on('message', onMessage);
    worker.on('error', (error: Error) => onError(error.message));
    return { postMessage: (request) => worker.postMessage(request), terminate: () => void worker.terminate() };
  }, timeLimitMs);
}
