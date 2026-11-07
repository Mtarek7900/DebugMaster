/**
 * A stand-in `console` handed to Learner code and check files, recording each
 * call as readable text in the order it happened.
 */
import { formatValue } from './formatValue';

export type ConsoleLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

export interface ConsoleEntry {
  level: ConsoleLevel;
  text: string;
}

/** Stops a runaway loop of logging from flooding memory (and the page) before the time limit hits. */
export const MAX_CONSOLE_ENTRIES = 500;

export function createCapturedConsole(onEntry?: (entry: ConsoleEntry) => void) {
  const entries: ConsoleEntry[] = [];
  const record = (entry: ConsoleEntry) => {
    entries.push(entry);
    onEntry?.(entry);
  };
  const write =
    (level: ConsoleLevel) =>
    (...args: unknown[]) => {
      if (entries.length > MAX_CONSOLE_ENTRIES) return;
      if (entries.length === MAX_CONSOLE_ENTRIES) {
        record({ level: 'warn', text: `Console output stopped after ${MAX_CONSOLE_ENTRIES} messages.` });
        return;
      }
      // Like a real console, top-level strings print bare; everything else is formatted.
      record({ level, text: args.map((arg) => (typeof arg === 'string' ? arg : formatValue(arg))).join(' ') });
    };

  const console = {
    log: write('log'),
    info: write('info'),
    warn: write('warn'),
    error: write('error'),
    debug: write('debug'),
    table: write('log'),
    dir: write('log'),
  };
  return { console, entries };
}
