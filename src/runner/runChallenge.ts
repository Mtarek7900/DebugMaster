/**
 * The Challenge Runner core: runs a Challenge's checks against the Learner's
 * code. Plain TypeScript with no DOM or Node dependencies, so it runs both in
 * the browser's Web Worker and in Vitest.
 */
import { CheckFailure, createCheckRegistry, expect } from './checkHelper';
import { loadModule } from './loadModule';

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
  | { outcome: 'completed'; checks: CheckResult[] }
  | { outcome: 'threw'; error: string; checks: CheckResult[] };

const CHECK_HELPER_NAMES = new Set(['check', 'expect']);

export async function runChallenge(
  challenge: RunnableChallenge,
  code: string,
  mode: RunMode,
): Promise<RunResult> {
  let exports;
  try {
    exports = loadModule(code);
  } catch (error) {
    return { outcome: 'threw', error: describeError(error), checks: [] };
  }

  const suites: Array<[CheckKind, string]> = [['visible', challenge.visibleChecks]];
  if (mode === 'submit') suites.push(['hidden', challenge.hiddenChecks]);

  const results: CheckResult[] = [];
  for (const [kind, source] of suites) {
    const { check, checks } = createCheckRegistry();
    const names = Object.keys(exports).filter((n) => !CHECK_HELPER_NAMES.has(n));
    try {
      // Check files see the Check helper and the code's exports as plain variables.
      new Function('check', 'expect', ...names, `"use strict";\n${source}`)(
        check,
        expect,
        ...names.map((n) => exports[n]),
      );
    } catch (error) {
      return { outcome: 'threw', error: describeError(error), checks: results };
    }

    for (const { name, fn } of checks) {
      try {
        await fn();
        results.push({ name, kind, passed: true });
      } catch (error) {
        if (error instanceof CheckFailure) {
          results.push({ name, kind, passed: false, message: error.message, expected: error.expected, actual: error.actual });
        } else {
          results.push({ name, kind, passed: false, message: describeError(error) });
        }
      }
    }
  }
  return { outcome: 'completed', checks: results };
}

function describeError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error);
}
