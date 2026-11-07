import type { ReactNode } from 'react';
import { BUG_CATEGORIES, DIFFICULTY_LABELS, type Challenge } from '../catalog/challenge';
import { STATUS_LABELS, type ChallengeStatus } from '../progress/progressStore';

interface ChallengeLabelsProps {
  challenge: Challenge;
  /** Shown as a label when given. */
  status?: ChallengeStatus;
  /** Anything else to show alongside the labels. */
  children?: ReactNode;
}

/** A Challenge's Difficulty, Bug Category and, optionally, its status, as a row of labels. */
export function ChallengeLabels({ challenge, status, children }: ChallengeLabelsProps) {
  return (
    <div className="labels">
      <span className={`label difficulty-${challenge.difficulty}`}>{DIFFICULTY_LABELS[challenge.difficulty]}</span>
      <span className="label">{withCode(BUG_CATEGORIES[challenge.bugCategory])}</span>
      {status && <span className={`label status-${status}`}>{STATUS_LABELS[status]}</span>}
      {children}
    </div>
  );
}

/** Renders `backticked` parts of a label as code. */
function withCode(label: string): ReactNode[] {
  return label.split('`').map((part, i) => (i % 2 === 1 ? <code key={i}>{part}</code> : part));
}
