const names = (rows) => rows.map((row) => row.name);

check("last week's leaderboard is highest first", () => {
  const lastWeek = [
    { name: 'Tom', score: 610 },
    { name: 'Priya', score: 875 },
    { name: 'Ana', score: 430 },
  ];
  expect(names(rankPlayers(lastWeek))).toEqual(['Priya', 'Tom', 'Ana']);
});

check('players on the same score share a rank, alphabetically', () => {
  const tied = [
    { name: 'Zoe', score: 500 },
    { name: 'Ben', score: 500 },
    { name: 'Cal', score: 300 },
  ];
  expect(rankPlayers(tied)).toEqual([
    { rank: 1, name: 'Ben', score: 500 },
    { rank: 1, name: 'Zoe', score: 500 },
    { rank: 3, name: 'Cal', score: 300 },
  ]);
});

check("this week's leaderboard puts Priya's 1,200 first", () => {
  const thisWeek = [
    { name: 'Tom', score: 950 },
    { name: 'Priya', score: 1200 },
    { name: 'Ana', score: 80 },
  ];
  expect(rankPlayers(thisWeek)).toEqual([
    { rank: 1, name: 'Priya', score: 1200 },
    { rank: 2, name: 'Tom', score: 950 },
    { rank: 3, name: 'Ana', score: 80 },
  ]);
});

check('a row shows rank, name and points', () => {
  expect(formatRow({ rank: 1, name: 'Priya', score: 1200 })).toBe('1. Priya: 1,200 pts');
});
