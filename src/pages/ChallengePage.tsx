import { useRef, useState } from 'react';
import { BUG_CATEGORIES, DIFFICULTY_LABELS, type Challenge } from '../catalog/challenge';
import { CodeEditor } from '../components/CodeEditor';
import { ConfirmButton } from '../components/ConfirmButton';
import { ConsolePanel } from '../components/ConsolePanel';
import { HintLadder, hintCount } from '../components/HintLadder';
import { Markdown } from '../components/Markdown';
import { ResultsPanel } from '../components/ResultsPanel';
import { browserProgressStore, type ChallengeStatus, type ProgressStore } from '../progress/progressStore';
import type { RunMode, Runner, RunResult } from '../runner/runner';

interface ChallengePageProps {
  challenge: Challenge;
  runner: Runner;
  progress?: ProgressStore;
}

const STATUS_LABELS: Partial<Record<ChallengeStatus, string>> = { solved: 'Solved', revealed: 'Revealed' };

export function ChallengePage({ challenge, runner, progress = browserProgressStore }: ChallengePageProps) {
  const code = useRef(challenge.brokenCode);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [initialProgress] = useState(() => progress.get(challenge.id));
  const [status, setStatus] = useState(initialProgress.status);
  const [hintsRevealed, setHintsRevealed] = useState(Math.min(initialProgress.hintsRevealed, challenge.hints.length));
  /** Set when the latest Submit passed every check: what that Submit meant for the Challenge. */
  const [passedAll, setPassedAll] = useState<PassedAll | null>(null);

  function revealNextHint() {
    setHintsRevealed(progress.recordHintRevealed(challenge.id, challenge.hints.length).hintsRevealed);
  }

  function giveUp() {
    setPassedAll(null);
    setStatus(progress.recordRevealed(challenge.id).status);
  }

  async function start(mode: RunMode) {
    setRunning(true);
    setPassedAll(null);
    try {
      const next = await runner(challenge, code.current, mode);
      setResult(next);
      if (mode === 'submit' && passedEveryCheck(next)) {
        const newStatus = progress.recordSolved(challenge.id).status;
        setStatus(newStatus);
        // A Revealed Challenge stays Revealed: announce that the checks pass, not Solved.
        setPassedAll(newStatus === 'solved' ? { status: 'solved', hintsUsed: hintsRevealed } : { status: 'revealed' });
      }
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
          {STATUS_LABELS[status] && <span className={`label status-${status}`}>{STATUS_LABELS[status]}</span>}
        </div>
        <h2>Bug Report</h2>
        <Markdown className="prose" source={challenge.bugReport} />
        <h2>Hints</h2>
        <HintLadder
          hints={challenge.hints}
          revealed={hintsRevealed}
          onRevealNext={revealNextHint}
        />
      </section>

      <section className="panel workbench" aria-label="Your code">
        <CodeEditor initialCode={challenge.brokenCode} onChange={(next) => (code.current = next)} />
        <div className="toolbar">
          <button type="button" className="button" onClick={() => start('run')} disabled={running}>
            Run
          </button>
          <button type="button" className="button primary" onClick={() => start('submit')} disabled={running}>
            Submit
          </button>
          {status === 'unattempted' && (
            <ConfirmButton
              label="Give Up"
              question="Give up?"
              confirmLabel="Give up and show the Walkthrough"
              cancelLabel="Keep trying"
              onConfirm={giveUp}
              disabled={running}
            >
              The Walkthrough will open and this Challenge will be marked Revealed for good. You can keep fixing it, but
              it will never count as Solved.
            </ConfirmButton>
          )}
        </div>
        {passedAll?.status === 'solved' && (
          <p className="solved-message" role="status">
            Solved with {hintCount(passedAll.hintsUsed)}. Your fix passes every Visible and Hidden Check.
          </p>
        )}
        {passedAll?.status === 'revealed' && (
          <p className="passed-message" role="status">
            Your fix passes every Visible and Hidden Check. The Challenge stays Revealed because you gave up.
          </p>
        )}
        <h2>Results</h2>
        <ResultsPanel result={result} running={running} />
        <h2>Console</h2>
        <ConsolePanel entries={running ? null : (result?.console ?? null)} />
      </section>

      {status !== 'unattempted' && (
        <section className="panel walkthrough" aria-labelledby="walkthrough-title">
          <h2 id="walkthrough-title">Walkthrough</h2>
          <Markdown className="prose" source={challenge.walkthrough} />
        </section>
      )}
    </main>
  );
}

/**
 * What a Submit that passed every check meant: Solved, with the Hints used for
 * that solve (later reveals do not change it), or still Revealed after Give Up.
 */
type PassedAll = { status: 'solved'; hintsUsed: number } | { status: 'revealed' };

function passedEveryCheck(result: RunResult): boolean {
  return result.outcome === 'completed' && result.checks.length > 0 && result.checks.every((c) => c.passed);
}
