/**
 * The Check helper: the small `check(name, fn)` / `expect(actual)` API that
 * Challenge check files are written against.
 */
import { formatValue } from './formatValue';

export class CheckFailure extends Error {
  constructor(
    message: string,
    readonly expected: string,
    readonly actual: string,
  ) {
    super(message);
    this.name = 'CheckFailure';
  }
}

export interface RegisteredCheck {
  name: string;
  fn: () => unknown;
}

export function expect(actual: unknown) {
  return {
    toBe(expected: unknown) {
      if (!Object.is(actual, expected)) {
        throw new CheckFailure('Expected values to be identical', formatValue(expected), formatValue(actual));
      }
    },
    toEqual(expected: unknown) {
      if (!deepEqual(actual, expected)) {
        throw new CheckFailure('Expected values to be equal', formatValue(expected), formatValue(actual));
      }
    },
    /** Passes if `actual` is a function that throws; with `message`, the error's message must include it. */
    toThrow(message?: string) {
      if (typeof actual !== 'function') {
        throw new CheckFailure('Expected a function to call', 'a function', formatValue(actual));
      }
      let returned: unknown;
      try {
        returned = actual();
      } catch (error) {
        const text = error instanceof Error ? error.message : String(error);
        if (message !== undefined && !text.includes(message)) {
          throw new CheckFailure(
            'Expected a different error message',
            `an error whose message includes ${formatValue(message)}`,
            formatValue(error),
          );
        }
        return;
      }
      throw new CheckFailure(
        'Expected the function to throw',
        message === undefined ? 'a thrown error' : `an error whose message includes ${formatValue(message)}`,
        `returned ${formatValue(returned)}`,
      );
    },
  };
}

/** Structural equality: same type, same own enumerable keys, recursively equal values. */
function deepEqual(a: unknown, b: unknown, seen = new Map<object, object>()): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  if (seen.get(a) === b) return true;
  seen.set(a, b);

  if (a instanceof Date) return a.getTime() === (b as Date).getTime();
  if (a instanceof RegExp) return String(a) === String(b);
  if (a instanceof Map) {
    const other = b as Map<unknown, unknown>;
    if (a.size !== other.size) return false;
    for (const [key, value] of a) {
      if (!other.has(key) || !deepEqual(value, other.get(key), seen)) return false;
    }
    return true;
  }
  if (a instanceof Set) {
    const other = b as Set<unknown>;
    return a.size === other.size && [...a].every((value) => other.has(value));
  }
  if (Array.isArray(a) && a.length !== (b as unknown[]).length) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(b, key) &&
      deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], seen),
  );
}

/** Creates a fresh `check` function plus the list it registers into. */
export function createCheckRegistry() {
  const checks: RegisteredCheck[] = [];
  const check = (name: string, fn: () => unknown) => {
    checks.push({ name, fn });
  };
  return { check, checks };
}
