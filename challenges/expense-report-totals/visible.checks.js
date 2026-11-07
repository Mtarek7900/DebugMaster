// Amounts are strings, exactly as typed into the web form.

check('a single expense totals to its amount', () => {
  expect(reportTotals([{ amount: '45', category: 'Travel' }]).total).toBe(45);
});

check('a $45 taxi and a $12.50 lunch total $57.50', () => {
  const report = reportTotals([
    { amount: '45', category: 'Travel' },
    { amount: '12.50', category: 'Meals' },
  ]);
  expect(report.total).toBe(57.5);
});

check('amounts typed with $ and commas add up', () => {
  const report = reportTotals([
    { amount: '$1,200.50', category: 'Equipment' },
    { amount: '$99.50', category: 'Equipment' },
  ]);
  expect(report.total).toBe(1300);
});

check('each category has its own total', () => {
  const report = reportTotals([
    { amount: '20', category: 'Travel' },
    { amount: '8', category: 'Meals' },
    { amount: '30', category: 'Travel' },
  ]);
  expect(report.byCategory).toEqual({ Travel: 50, Meals: 8 });
});

check('text that is not an amount is rejected', () => {
  expect(() => reportTotals([{ amount: 'twelve', category: 'Meals' }])).toThrow('not an amount');
});
