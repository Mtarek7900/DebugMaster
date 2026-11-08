import { useEffect, useRef, useState } from 'react';
import type { Challenge } from '../catalog/challenge';
import type { ChallengeFilters } from '../catalog/filters';
import { ChallengeLabels } from '../components/ChallengeLabels';
import { CodeEditor } from '../components/CodeEditor';
import { ConfirmButton } from '../components/ConfirmButton';
import { ConsolePanel } from '../components/ConsolePanel';
import { HintLadder, hintCount } from '../components/HintLadder';
import { Markdown } from '../components/Markdown';
import { ResultsPanel } from '../components/ResultsPanel';
import { browserProgressStore, hintsRevealedFor, hintsUsedFor, type ProgressStore } from '../progress/progressStore';
import { challengeHref, listHref } from '../routing/routes';
import type { RunMode, Runner, RunResult } from '../runner/runner';

interface ChallengePageProps {
  challenge: Challenge;
  runner: Runner;
  progress?: ProgressStore;
  /** The Challenge after this one in list order, among those matching `filters`; none on the last. */
  nextChallenge?: Challenge;
  /** The list filters this Challenge was opened under, kept in its links. */
  filters?: ChallengeFilters;
}

export function ChallengePage({
  challenge,
  runner,
  progress = browserProgressStore,
  nextChallenge,
  filters = {},
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
  const [hintsRevealed, setHintsRevealed] = useState(hintsRevealedFor(challenge, initialProgress));
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

  /** Set by Give Up, which promises to show the Walkthrough: on desktop it opens below the fold. */
  const showWalkthrough = useRef(false);
  const walkthrough = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!showWalkthrough.current || !walkthrough.current) return;
    showWalkthrough.current = false;
    walkthrough.current.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }, [status]);

  function giveUp() {
    setPassedAll(null);
    showWalkthrough.current = true;
    setStatus(progress.recordRevealed(challenge.id).status);
  }

  async function start(mode: RunMode) {
    setRunning(true);
    setPassedAll(null);
    try {
      const next = await runner(challenge, code.current, mode);
      setResult(next);
      if (mode === 'submit' && passedEveryCheck(next)) {
        const solved = progress.recordSolved(challenge.id);
        setStatus(solved.status);
        // A Revealed Challenge stays Revealed: announce that the checks pass, not Solved.
        setPassedAll(
          solved.status === 'solved'
            ? { status: 'solved', hintsUsed: hintsUsedFor(challenge, solved) ?? 0 }
            : { status: 'revealed' },
        );
      }
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="challenge-page">
      <section className="panel bug-report" aria-labelledby="challenge-title">
        <a className="back-link" href={listHref(filters)}>
          ← Back to Challenges
        </a>
        <h1 id="challenge-title">{challenge.title}</h1>
        {/* A Challenge not started yet needs no status label while the Learner is on it. */}
        <ChallengeLabels challenge={challenge} status={status === 'not-started' ? undefined : status} />
        <h2>Bug Report</h2>
        <Markdown className="prose" source={challenge.bugReport} />
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
          {status === 'not-started' && (
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
        {/* Once the attempt is over, Solved or Revealed, the Learner can move on. */}
        {status !== 'not-started' && nextChallenge && (
          <a className="button primary next-challenge" href={challengeHref(nextChallenge.id, filters)}>
            Next Challenge: {nextChallenge.title} →
          </a>
        )}
        {/* Right under the editor, so what the code logs is in view while working on it. */}
        <h2>Console</h2>
        <ConsolePanel entries={running ? null : (result?.console ?? null)} />
      </section>

      {/* Sections are in phone order: they stack as written there, and the desktop grid places them in columns. */}
      <section className="panel output" aria-labelledby="results-title">
        <h2 id="results-title">Results</h2>
        <ResultsPanel result={result} running={running} />
      </section>

      <section className="panel hints-panel" aria-labelledby="hints-title">
        <h2 id="hints-title">Hints</h2>
        <HintLadder hints={challenge.hints} revealed={hintsRevealed} onRevealNext={revealNextHint} />
      </section>

      {status !== 'not-started' && (
        <section className="panel walkthrough" aria-labelledby="walkthrough-title" ref={walkthrough}>
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
 * the first Solve (later reveals do not change it), or still Revealed after Give Up.
 */
type PassedAll = { status: 'solved'; hintsUsed: number } | { status: 'revealed' };

function passedEveryCheck(result: RunResult): boolean {
  return result.outcome === 'completed' && result.checks.length > 0 && result.checks.every((c) => c.passed);
}
