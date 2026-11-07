import type { ConsoleEntry } from '../runner/runner';

interface ConsolePanelProps {
  /** The last run's console output, or null before the first run. */
  entries: ConsoleEntry[] | null;
}

/** Shows what the Learner's code wrote with `console.log` and friends during the last run. */
export function ConsolePanel({ entries }: ConsolePanelProps) {
  return (
    <div className="console" role="log" aria-label="Console">
      {entries === null ? (
        <p className="console-empty">Output from console.log appears here when you press Run.</p>
      ) : entries.length === 0 ? (
        <p className="console-empty">No console output.</p>
      ) : (
        <ol className="console-lines">
          {entries.map((entry, i) => (
            <li key={i} className={`console-line console-${entry.level}`}>
              {entry.text}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
