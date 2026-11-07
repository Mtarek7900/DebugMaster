import { useEffect, useRef, useState } from 'react';
import { BUG_CATEGORIES, DIFFICULTY_LABELS, type Challenge } from '../catalog/challenge';
import { CodeEditor } from '../components/CodeEditor';
import { ConfirmButton } from '../components/ConfirmButton';
import { ConsolePanel } from '../components/ConsolePanel';
import { HintLadder, hintCount } from '../components/HintLadder';
import { Markdown } from '../components/Markdown';
import { ResultsPanel } from '../components/ResultsPanel';
import { browserProgressStore, type ChallengeStatus, type ProgressStore } from '../progress/progressStore';
import { challengeHref, LIST_HREF } from '../routing/routes';
import type { RunMode, Runner, RunResult } from '../runner/runner';

interface ChallengePageProps {
  challenge: Challenge;
  runner: Runner;
  progress?: ProgressStore;
  /** The Challenge after this one in list order; none on the last. */
  nextChallenge?: Challenge;
}

const STATUS_LABELS: Partial<Record<ChallengeStatus, string>> = { solved: 'Solved', revealed: 'Revealed' };

export function ChallengePage({
  challenge,
  runner,
  progress = browserProgressStore,
  nextChallenge,
}: ChallengePageProps) {
  /** The code the editor opens with; Reset swaps in the Broken Code and a fresh editor. */
  const [editorStart, setEditorStart] = useState(() => ({
    code: progress.getCode(challenge.id) ?? challenge.brokenCode,
    resets: 0,
  }));
  const code = useRef(editorStart.code);
  const autosave = useAutosave((next) => progress.saveCode(challenge.id, next));
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

  /** Rewrites only the code: the status and Hint count stay as they are. */
  function resetCode() {
    autosave.cancel();
    progress.clearCode(challenge.id);
    code.current = challenge.brokenCode;
    setEditorStart((current) => ({ code: challenge.brokenCode, resets: current.resets + 1 }));
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
        <a className="back-link" href={LIST_HREF}>
          ← All Challenges
        </a>
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
        <CodeEditor
          key={editorStart.resets}
          initialCode={editorStart.code}
          onChange={(next) => {
            code.current = next;
            autosave.schedule(next);
          }}
        />
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
          <ConfirmButton
            label="Reset"
            question="Reset your code?"
            confirmLabel="Reset to the Broken Code"
            cancelLabel="Keep my code"
            onConfirm={resetCode}
            disabled={running}
          >
            Your edits will be replaced by the original Broken Code. Your progress and revealed Hints stay as they are.
          </ConfirmButton>
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
        {status === 'solved' && nextChallenge && (
          <a className="button primary next-challenge" href={challengeHref(nextChallenge.id)}>
            Next Challenge: {nextChallenge.title} →
          </a>
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

const AUTOSAVE_DELAY_MS = 300;

/**
 * Saves the latest value once typing pauses, and on unmount or pagehide saves
 * whatever is still waiting, so leaving the page never drops the last few keystrokes.
 */
function useAutosave(save: (value: string) => void) {
  const saveRef = useRef(save);
  saveRef.current = save;
  const [autosave] = useState(() => {
    let pending: { value: string; timer: ReturnType<typeof setTimeout> } | null = null;
    return {
      schedule(value: string) {
        if (pending) clearTimeout(pending.timer);
        pending = { value, timer: setTimeout(() => autosave.flush(), AUTOSAVE_DELAY_MS) };
      },
      flush() {
        if (!pending) return;
        clearTimeout(pending.timer);
        const { value } = pending;
        pending = null;
        saveRef.current(value);
      },
      cancel() {
        if (pending) clearTimeout(pending.timer);
        pending = null;
      },
    };
  });
  useEffect(() => {
    // A reload or closed tab never unmounts React, so save on the way out too.
    const flush = () => autosave.flush();
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [autosave]);
  return autosave;
}

/**
 * What a Submit that passed every check meant: Solved, with the Hints used for
 * that solve (later reveals do not change it), or still Revealed after Give Up.
 */
type PassedAll = { status: 'solved'; hintsUsed: number } | { status: 'revealed' };

function passedEveryCheck(result: RunResult): boolean {
  return result.outcome === 'completed' && result.checks.length > 0 && result.checks.every((c) => c.passed);
}
