import { BUG_CATEGORIES, DIFFICULTIES, DIFFICULTY_LABELS, compareChallenges, type Challenge } from '../catalog/challenge';
import { matchesFilters, toFilters, type ChallengeFilters } from '../catalog/filters';
import { ChallengeLabels } from '../components/ChallengeLabels';
import { hintCount } from '../components/HintLadder';
import { browserProgressStore, hintsUsedFor, type ProgressStore } from '../progress/progressStore';
import { challengeHref } from '../routing/routes';

interface ChallengeListPageProps {
  challenges: Challenge[];
  progress?: ProgressStore;
  /** The filters in effect; the app keeps them in the URL. */
  filters: ChallengeFilters;
  onFiltersChange: (filters: ChallengeFilters) => void;
}

export function ChallengeListPage({
  challenges,
  progress = browserProgressStore,
  filters,
  onFiltersChange,
}: ChallengeListPageProps) {
  const matching = challenges.filter((challenge) => matchesFilters(challenge, filters)).sort(compareChallenges);

  return (
    <main className="challenge-list-page">
      <h1>Challenges</h1>
      <div className="filters">
        <label>
          Difficulty
          <select
            value={filters.difficulty ?? ''}
            onChange={(event) => onFiltersChange(toFilters({ ...filters, difficulty: event.target.value }))}
          >
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
          <select
            value={filters.bugCategory ?? ''}
            onChange={(event) => onFiltersChange(toFilters({ ...filters, bugCategory: event.target.value }))}
          >
            <option value="">All</option>
            {Object.entries(BUG_CATEGORIES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {matching.length === 0 ? (
        <p className="list-empty">No Challenges match these filters. Try another Difficulty or Bug Category.</p>
      ) : (
        <ul className="challenge-list" aria-label="Challenges">
          {matching.map((challenge) => {
            const challengeProgress = progress.get(challenge.id);
            return (
              <li key={challenge.id} className="challenge-entry">
                <a href={challengeHref(challenge.id, filters)}>{challenge.title}</a>
                <ChallengeLabels challenge={challenge} status={challengeProgress.status}>
                  {challengeProgress.status === 'solved' && (
                    <span className="hints-used">{hintCount(hintsUsedFor(challenge, challengeProgress) ?? 0)} used</span>
                  )}
                </ChallengeLabels>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
