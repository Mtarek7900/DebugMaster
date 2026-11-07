// Accounts are loaded one after another, as on the server.
const DEFAULT_CHANNELS = { email: true, push: true, sms: false };

check('a new account gets the default channels', () => {
  expect(settingsFor().channels).toEqual(DEFAULT_CHANNELS);
});

check("an account's saved choices are applied", () => {
  const settings = settingsFor({ channels: { email: false }, topics: { promotions: true } });
  expect(settings.channels.email).toBe(false);
  expect(settings.topics.promotions).toBe(true);
});

check("one account's choices do not change the next account's settings", () => {
  settingsFor({ channels: { sms: true } });
  const nextAccount = settingsFor();
  expect(nextAccount.channels).toEqual(DEFAULT_CHANNELS);
});

check('Reset to defaults switches promotions off again', () => {
  settingsFor({ topics: { promotions: true } });
  expect(defaultSettings().topics.promotions).toBe(false);
});

check('quiet hours hold back promotions overnight', () => {
  const settings = settingsFor({
    channels: { email: true },
    topics: { promotions: true },
    quietHours: { start: 22, end: 7 },
  });
  expect(shouldNotify(settings, 'email', 'promotions', 23)).toBe(false);
  expect(shouldNotify(settings, 'email', 'promotions', 12)).toBe(true);
});

check('security alerts are sent even during quiet hours', () => {
  const settings = settingsFor({ channels: { push: true }, quietHours: { start: 0, end: 24 } });
  expect(shouldNotify(settings, 'push', 'securityAlerts', 3)).toBe(true);
});
