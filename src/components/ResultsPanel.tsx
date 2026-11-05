import type { RunResult } from '../runner/runner';

interface ResultsPanelProps {
  result: RunResult | null;
  running: boolean;
}

/** Shows each check's name, whether it passed, and expected versus actual on failure. */
export function ResultsPanel({ result, running }: ResultsPanelProps) {
  if (running) return <p className="results-empty">Running…</p>;
  if (!result) return <p className="results-empty">Press Run to run the Visible Checks against your code.</p>;

  const passedCount = result.checks.filter((c) => c.passed).length;
  return (
    <div className="results">
      {result.outcome === 'threw' && (
        <p className="results-error" role="alert">
          Your code threw an error: <code>{result.error}</code>
        </p>
      )}
      {result.checks.length > 0 && (
        <p className="results-summary">
          {passedCount} of {result.checks.length} checks passed
        </p>
      )}
      <ul className="check-list" aria-label="Check results">
        {result.checks.map((check, i) => (
          <li key={i} className={`check ${check.passed ? 'check-passed' : 'check-failed'}`}>
            <div className="check-heading">
              <span className="check-status">{check.passed ? 'Passed' : 'Failed'}</span>
              <span className="check-name">{check.name}</span>
            </div>
            {!check.passed && (
              <div className="check-detail">
                {check.expected !== undefined ? (
                  <dl>
                    <dt>Expected</dt>
                    <dd>
                      <code>{check.expected}</code>
                    </dd>
                    <dt>Actual</dt>
                    <dd>
                      <code>{check.actual}</code>
                    </dd>
                  </dl>
                ) : (
                  <code>{check.message}</code>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
