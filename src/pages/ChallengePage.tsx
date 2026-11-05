import { useRef, useState } from 'react';
import { BUG_CATEGORIES, DIFFICULTY_LABELS, type Challenge } from '../catalog/challenge';
import { CodeEditor } from '../components/CodeEditor';
import { ConsolePanel } from '../components/ConsolePanel';
import { Markdown } from '../components/Markdown';
import { ResultsPanel } from '../components/ResultsPanel';
import type { Runner, RunResult } from '../runner/runner';

interface ChallengePageProps {
  challenge: Challenge;
  runner: Runner;
}

export function ChallengePage({ challenge, runner }: ChallengePageProps) {
  const code = useRef(challenge.brokenCode);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    try {
      setResult(await runner(challenge, code.current, 'run'));
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="challenge-page">
      <section className="panel bug-report" aria-labelledby="challenge-title">
        <h1 id="challenge-title">{challenge.title}</h1>
        <div className="labels">
          <span className={`label difficulty-${challenge.difficulty}`}>{DIFFICULTY_LABELS[challenge.difficulty]}</span>
          <span className="label">{BUG_CATEGORIES[challenge.bugCategory]}</span>
        </div>
        <h2>Bug Report</h2>
        <Markdown className="prose" source={challenge.bugReport} />
      </section>

      <section className="panel workbench" aria-label="Your code">
        <CodeEditor initialCode={challenge.brokenCode} onChange={(next) => (code.current = next)} />
        <div className="toolbar">
          <button type="button" className="button primary" onClick={run} disabled={running}>
            Run
          </button>
        </div>
        <h2>Results</h2>
        <ResultsPanel result={result} running={running} />
        <h2>Console</h2>
        <ConsolePanel entries={running ? null : (result?.console ?? null)} />
      </section>
    </main>
  );
}
