// The weekly leaderboard: highest score first. Players on the same score share
// a rank and are listed alphabetically, and the next rank skips (1, 1, 3).

export function rankPlayers(entries) {
  const valid = entries.filter((entry) => Number.isFinite(entry.score) && entry.score >= 0);
  const byName = [...valid].sort((a, b) => a.name.localeCompare(b.name));

  // Each distinct score once, highest first.
  const scores = [...new Set(byName.map((entry) => entry.score))].sort().reverse();

  const rows = [];
  for (const score of scores) {
    const rank = rows.length + 1;
    for (const entry of byName) {
      if (entry.score === score) {
        rows.push({ rank, name: entry.name, score });
      }
    }
  }
  return rows;
}

// One row as shown in the game, e.g. "1. Priya: 1,200 pts".
export function formatRow(row) {
  const points = row.score.toLocaleString('en-US');
  return `${row.rank}. ${row.name}: ${points} ${row.score === 1 ? 'pt' : 'pts'}`;
}
