import { useState } from 'react';
import {
  BUG_CATEGORIES,
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  compareChallenges,
  type BugCategory,
  type Challenge,
  type Difficulty,
} from '../catalog/challenge';
import { hintCount } from '../components/HintLadder';
import { browserProgressStore, type ChallengeStatus, type ProgressStore } from '../progress/progressStore';
import { challengeHref } from '../routing/routes';

interface ChallengeListPageProps {
  challenges: Challenge[];
  progress?: ProgressStore;
}

const STATUS_LABELS: Record<ChallengeStatus, string> = {
  unattempted: 'Not started',
  solved: 'Solved',
  revealed: 'Revealed',
};

/** A filter's value: one Difficulty, or '' for all of them. */
type DifficultyFilter = Difficulty | '';
/** A filter's value: one Bug Category, or '' for all of them. */
type BugCategoryFilter = BugCategory | '';

export function ChallengeListPage({ challenges, progress = browserProgressStore }: ChallengeListPageProps) {
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('');
  const [bugCategory, setBugCategory] = useState<BugCategoryFilter>('');
  const shown = challenges
    .filter((challenge) => !difficulty || challenge.difficulty === difficulty)
    .filter((challenge) => !bugCategory || challenge.bugCategory === bugCategory)
    .sort(compareChallenges);

  return (
    <main className="challenge-list-page">
      <h1>Challenges</h1>
      <div className="filters">
        <label>
          Difficulty
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as DifficultyFilter)}>
            <option value="">All</option>
            {DIFFICULTIES.map((value) => (
              <option key={value} value={value}>
                {DIFFICULTY_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Bug Category
          <select value={bugCategory} onChange={(event) => setBugCategory(event.target.value as BugCategoryFilter)}>
            <option value="">All</option>
            {Object.entries(BUG_CATEGORIES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {shown.length === 0 ? (
        <p className="list-empty">No Challenges match these filters. Try another Difficulty or Bug Category.</p>
      ) : (
        <ul className="challenge-list" aria-label="Challenges">
          {shown.map((challenge) => {
            const { status, hintsRevealed } = progress.get(challenge.id);
            return (
              <li key={challenge.id} className="challenge-entry">
                <a href={challengeHref(challenge.id)}>{challenge.title}</a>
                <div className="labels">
                  <span className={`label difficulty-${challenge.difficulty}`}>
                    {DIFFICULTY_LABELS[challenge.difficulty]}
                  </span>
                  <span className="label">{BUG_CATEGORIES[challenge.bugCategory]}</span>
                  <span className={`label status-${status}`}>{STATUS_LABELS[status]}</span>
                  {status === 'solved' && (
                    <span className="hints-used">{hintCount(Math.min(hintsRevealed, challenge.hints.length))} used</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
