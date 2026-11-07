const makePanels = (count) =>
  Array.from({ length: count }, (_, i) => ({ id: `panel-${i + 1}`, title: `Panel ${i + 1}` }));

check('every shortcut opens a different panel', () => {
  const dashboard = createDashboard(makePanels(4));
  const opened = ['Alt+1', 'Alt+2', 'Alt+3', 'Alt+4'].map((key) => {
    dashboard.press(key);
    return dashboard.openPanel();
  });
  expect(opened).toEqual(['panel-1', 'panel-2', 'panel-3', 'panel-4']);
});

check('with 12 panels, only Alt+1 to Alt+9 are shortcuts', () => {
  const dashboard = createDashboard(makePanels(12));
  dashboard.press('Alt+5');
  expect(dashboard.openPanel()).toBe('panel-5');
  dashboard.press('Alt+9');
  expect(dashboard.openPanel()).toBe('panel-9');
  expect(dashboard.press('Alt+10')).toBe(false);
});

check('history lists the panels opened, skipping repeats', () => {
  const dashboard = createDashboard([
    { id: 'sales', title: 'Sales' },
    { id: 'refunds', title: 'Refunds' },
    { id: 'churn', title: 'Churn' },
  ]);
  for (const key of ['Alt+2', 'Alt+2', 'Alt+1', 'Alt+3']) dashboard.press(key);
  expect(dashboard.history()).toEqual(['refunds', 'sales', 'churn']);
});

check('two dashboards do not share shortcuts', () => {
  const first = createDashboard([{ id: 'a', title: 'A' }, { id: 'b', title: 'B' }]);
  const second = createDashboard([{ id: 'x', title: 'X' }, { id: 'y', title: 'Y' }]);
  first.press('Alt+1');
  second.press('Alt+1');
  expect([first.openPanel(), second.openPanel()]).toEqual(['a', 'x']);
});

check('a dashboard with one panel', () => {
  const dashboard = createDashboard([{ id: 'only', title: 'Only' }]);
  expect(dashboard.press('Alt+1')).toBe(true);
  expect(dashboard.openPanel()).toBe('only');
});
