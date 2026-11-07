check('parseAmount gives a number', () => {
  expect(parseAmount(' $2,000 ')).toBe(2000);
  expect(parseAmount('0.75')).toBe(0.75);
});

check('a refund is taken off the total', () => {
  const report = reportTotals([
    { amount: '$250.00', category: 'Travel' },
    { amount: '42.80', category: 'Meals' },
    { amount: '-$15.00', category: 'Travel' },
  ]);
  expect(report.total).toBe(277.8);
  expect(report.byCategory).toEqual({ Travel: 235, Meals: 42.8 });
  expect(report.count).toBe(3);
});

check('typed amounts and numbers mix', () => {
  expect(reportTotals([{ amount: 10, category: 'A' }, { amount: '5.25', category: 'A' }, { amount: '$4.75', category: 'B' }]).total).toBe(20);
});

check('cents add up without rounding errors', () => {
  expect(reportTotals([{ amount: '0.10', category: 'A' }, { amount: '0.20', category: 'A' }]).total).toBe(0.3);
});

check('an empty report totals zero', () => {
  expect(reportTotals([])).toEqual({ total: 0, byCategory: {}, count: 0 });
});

check('the summary line shows the total', () => {
  const report = reportTotals([{ amount: '$1,200.50', category: 'Equipment' }, { amount: '99.50', category: 'Equipment' }]);
  expect(formatAmount(report.total)).toBe('$1,300.00');
  expect(formatAmount(-15)).toBe('-$15.00');
});
