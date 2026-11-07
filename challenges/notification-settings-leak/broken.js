// Settings for the Account > Notifications screen. Every account starts from
// the defaults below, then the choices it has saved are applied on top.

const DEFAULT_SETTINGS = {
  channels: { email: true, push: true, sms: false },
  topics: { orderUpdates: true, promotions: false, securityAlerts: true },
  quietHours: null,
};

// Also used by the "Reset to defaults" button.
export function defaultSettings() {
  return { ...DEFAULT_SETTINGS };
}

export function settingsFor(saved = {}) {
  const settings = defaultSettings();
  for (const [channel, on] of Object.entries(saved.channels ?? {})) {
    settings.channels[channel] = on;
  }
  for (const [topic, on] of Object.entries(saved.topics ?? {})) {
    settings.topics[topic] = on;
  }
  if (saved.quietHours) {
    settings.quietHours = { start: saved.quietHours.start, end: saved.quietHours.end };
  }
  return settings;
}

// Security alerts ignore the topic switches and quiet hours, but still need an enabled channel.
export function shouldNotify(settings, channel, topic, hour) {
  if (!settings.channels[channel]) {
    return false;
  }
  if (topic === 'securityAlerts') {
    return true;
  }
  return Boolean(settings.topics[topic]) && !isQuietHour(settings, hour);
}

// Quiet hours may wrap past midnight, e.g. 22:00 to 07:00.
function isQuietHour(settings, hour) {
  const quiet = settings.quietHours;
  if (!quiet || hour === undefined) {
    return false;
  }
  return quiet.start <= quiet.end
    ? hour >= quiet.start && hour < quiet.end
    : hour >= quiet.start || hour < quiet.end;
}
