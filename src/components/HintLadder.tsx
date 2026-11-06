import type { Hint } from '../catalog/challenge';
import { Markdown } from './Markdown';

interface HintLadderProps {
  hints: Hint[];
  /** How many Hints, counted from the first, the Learner has revealed. */
  revealed: number;
  onRevealNext: () => void;
}

/**
 * The Hint ladder: Hints revealed one at a time in the author's order, each
 * naming the debugging-method step it teaches. Revealed Hints stay visible.
 */
export function HintLadder({ hints, revealed, onRevealNext }: HintLadderProps) {
  const shown = hints.slice(0, revealed);
  const remaining = hints.length - shown.length;

  return (
    <div className="hint-ladder">
      {shown.length > 0 && (
        <ol className="hints" aria-label="Revealed Hints">
          {shown.map((hint, i) => (
            <li key={i} className="hint">
              <h3>
                Hint {i + 1}: {hint.step}
              </h3>
              <Markdown className="prose" source={hint.body} />
            </li>
          ))}
        </ol>
      )}
      <div className="hint-controls">
        <button type="button" className="button" onClick={onRevealNext} disabled={remaining === 0}>
          Reveal next Hint
        </button>
        <span className="hints-remaining">{remainingLabel(remaining)}</span>
      </div>
    </div>
  );
}

/** "no Hints", "1 Hint", "2 Hints". */
export function hintCount(count: number): string {
  if (count === 0) return 'no Hints';
  return `${count} ${count === 1 ? 'Hint' : 'Hints'}`;
}

function remainingLabel(remaining: number): string {
  return remaining === 0 ? 'No Hints remaining' : `${hintCount(remaining)} remaining`;
}
