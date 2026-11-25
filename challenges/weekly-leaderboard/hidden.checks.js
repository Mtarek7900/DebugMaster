const scores = (rows) => rows.map((row) => row.score);

check('scores of different lengths are ranked by value', () => {
  const entries = [9, 10, 100, 2, 25, 1000].map((score, i) => ({ name: `Player ${i}`, score }));
  expect(scores(rankPlayers(entries))).toEqual([1000, 100, 25, 10, 9, 2]);
});

check('a score of 0 comes last', () => {
  const entries = [
    { name: 'Dev', score: 0 },
    { name: 'Eli', score: 5 },
    { name: 'Fay', score: 40 },
  ];
  expect(rankPlayers(entries).map((row) => row.name)).toEqual(['Fay', 'Eli', 'Dev']);
});

check('ties below the top keep shared ranks with big scores', () => {
  const entries = [
    { name: 'Max', score: 90 },
    { name: 'Lia', score: 1500 },
    { name: 'Kai', score: 90 },
    { name: 'Jo', score: 300 },
  ];
  expect(rankPlayers(entries)).toEqual([
    { rank: 1, name: 'Lia', score: 1500 },
    { rank: 2, name: 'Jo', score: 300 },
    { rank: 3, name: 'Kai', score: 90 },
    { rank: 3, name: 'Max', score: 90 },
  ]);
});

check('entries without a valid score are left off', () => {
  const entries = [
    { name: 'Ana', score: 80 },
    { name: 'Bot', score: -1 },
    { name: 'Ghost', score: NaN },
    { name: 'Tom', score: 950 },
  ];
  expect(rankPlayers(entries).map((row) => row.name)).toEqual(['Tom', 'Ana']);
});

check('the original entries are not reordered', () => {
  const entries = [
    { name: 'Tom', score: 950 },
    { name: 'Priya', score: 1200 },
  ];
  rankPlayers(entries);
  expect(entries.map((entry) => entry.name)).toEqual(['Tom', 'Priya']);
});

check('one point is "1 pt"', () => {
  expect(formatRow({ rank: 4, name: 'Ana', score: 1 })).toBe('4. Ana: 1 pt');
});
