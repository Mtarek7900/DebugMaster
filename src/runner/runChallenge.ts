/**
 * The Challenge Runner core: runs a Challenge's checks against the Learner's
 * code. Plain TypeScript with no DOM or Node dependencies, so it runs both in
 * the browser's Web Worker and in Vitest.
 */
import { createCapturedConsole, type ConsoleEntry } from './captureConsole';
import { CheckFailure, createCheckRegistry, expect } from './checkHelper';
import { loadModule } from './loadModule';

export type { ConsoleEntry, ConsoleLevel } from './captureConsole';

export type RunMode = 'run' | 'submit';

export interface RunnableChallenge {
  visibleChecks: string;
  hiddenChecks: string;
}

export type CheckKind = 'visible' | 'hidden';

export interface CheckResult {
  name: string;
  kind: CheckKind;
  passed: boolean;
  /** Set when the check failed. */
  message?: string;
  expected?: string;
  actual?: string;
}

export type RunResult =
  | { outcome: 'completed'; checks: CheckResult[]; console: ConsoleEntry[] }
  | { outcome: 'threw'; error: string; checks: CheckResult[]; console: ConsoleEntry[] }
  /** The run passed the time limit and was stopped; `checks` is empty. */
  | { outcome: 'timed-out'; checks: CheckResult[]; console: ConsoleEntry[] };

export interface RunOptions {
  /** Called as each console message is written, before the run finishes. */
  onConsole?: (entry: ConsoleEntry) => void;
}

/** Names the Runner passes into check files; an export with one of these names is hidden from them. */
const INJECTED_NAMES = new Set(['check', 'expect', 'console']);

export async function runChallenge(
  challenge: RunnableChallenge,
  code: string,
  mode: RunMode,
  options: RunOptions = {},
): Promise<RunResult> {
  const { console, entries } = createCapturedConsole(options.onConsole);

  let exports;
  try {
    exports = loadModule(code, { console });
  } catch (error) {
    return { outcome: 'threw', error: describeError(error), checks: [], console: entries };
  }

  const suites: Array<[CheckKind, string]> = [['visible', challenge.visibleChecks]];
  if (mode === 'submit') suites.push(['hidden', challenge.hiddenChecks]);

  const results: CheckResult[] = [];
  /** The first error a check threw that was not a failed assertion. */
  let crash: string | undefined;
  for (const [kind, source] of suites) {
    const { check, checks } = createCheckRegistry();
    const names = Object.keys(exports).filter((n) => !INJECTED_NAMES.has(n));
    try {
      // Check files see the Check helper, the captured console and the code's exports as plain variables.
      new Function('check', 'expect', 'console', ...names, `"use strict";\n${source}`)(
        check,
        expect,
        console,
        ...names.map((n) => exports[n]),
      );
    } catch (error) {
      return { outcome: 'threw', error: describeError(error), checks: results, console: entries };
    }

    for (const { name, fn } of checks) {
      try {
        await fn();
        results.push({ name, kind, passed: true });
      } catch (error) {
        if (error instanceof CheckFailure) {
          results.push({ name, kind, passed: false, message: error.message, expected: error.expected, actual: error.actual });
        } else {
          // Not an assertion: the code crashed. The check fails, and the run reports the crash.
          const message = describeError(error);
          results.push({ name, kind, passed: false, message });
          crash ??= message;
        }
      }
    }
  }
  if (crash !== undefined) return { outcome: 'threw', error: crash, checks: results, console: entries };
  return { outcome: 'completed', checks: results, console: entries };
}

export function describeError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error);
}
