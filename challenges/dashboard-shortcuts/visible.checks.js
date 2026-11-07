const panels = [
  { id: 'revenue', title: 'Revenue' },
  { id: 'traffic', title: 'Traffic' },
  { id: 'signups', title: 'Signups' },
];

check('Alt+1 opens the Revenue panel', () => {
  const dashboard = createDashboard(panels);
  dashboard.press('Alt+1');
  expect(dashboard.openPanel()).toBe('revenue');
});

check('Alt+2 opens the Traffic panel', () => {
  const dashboard = createDashboard(panels);
  dashboard.press('Alt+2');
  expect(dashboard.openPanel()).toBe('traffic');
});

check('Alt+3 opens the Signups panel', () => {
  const dashboard = createDashboard(panels);
  dashboard.press('Alt+3');
  expect(dashboard.openPanel()).toBe('signups');
});

check("the cheat sheet lists each panel's shortcut", () => {
  expect(describeShortcuts(panels)).toEqual(['Alt+1  Revenue', 'Alt+2  Traffic', 'Alt+3  Signups']);
});

check('a key with no shortcut does nothing', () => {
  const dashboard = createDashboard(panels);
  expect(dashboard.press('Alt+7')).toBe(false);
  expect(dashboard.openPanel()).toBe(null);
});
