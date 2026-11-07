check("one account's topics do not change the next account's topics", () => {
  settingsFor({ topics: { orderUpdates: false, securityAlerts: false } });
  expect(settingsFor().topics).toEqual({ orderUpdates: true, promotions: false, securityAlerts: true });
});

check('changing the defaults object on screen does not change the defaults', () => {
  const onScreen = defaultSettings();
  onScreen.channels.push = false;
  onScreen.topics.orderUpdates = false;
  expect(defaultSettings().channels.push).toBe(true);
  expect(defaultSettings().topics.orderUpdates).toBe(true);
});

check('each account in a row gets exactly its own choices', () => {
  const accounts = [
    { saved: { channels: { email: false } }, channels: { email: false, push: true, sms: false } },
    { saved: { channels: { sms: true, push: false } }, channels: { email: true, push: false, sms: true } },
    { saved: {}, channels: { email: true, push: true, sms: false } },
  ];
  for (const account of accounts) {
    expect(settingsFor(account.saved).channels).toEqual(account.channels);
  }
});

check('every account gets its own settings objects', () => {
  const first = settingsFor();
  const second = settingsFor();
  expect(first.channels === second.channels).toBe(false);
  expect(first.topics === second.topics).toBe(false);
});

check('a channel that is off sends nothing, whatever the topic', () => {
  const settings = settingsFor({ channels: { email: false } });
  expect(shouldNotify(settings, 'email', 'orderUpdates', 12)).toBe(false);
  expect(shouldNotify(settings, 'email', 'securityAlerts', 12)).toBe(false);
  expect(shouldNotify(settingsFor(), 'sms', 'orderUpdates', 12)).toBe(false);
});

check('quiet hours within one day', () => {
  const settings = settingsFor({ quietHours: { start: 13, end: 15 } });
  expect(shouldNotify(settings, 'email', 'orderUpdates', 14)).toBe(false);
  expect(shouldNotify(settings, 'email', 'orderUpdates', 15)).toBe(true);
});
