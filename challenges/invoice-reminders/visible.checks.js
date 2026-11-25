const TODAY = '2026-11-25';
const invoice = (id, email, dueDate, extra = {}) => ({ id, email, dueDate, customer: 'Sam', amount: 120, paid: false, ...extra });

// A pretend mailer. Addresses in `bounces` are refused by the mail server.
function pretendMailer(bounces = []) {
  const attempted = [];
  return {
    attempted,
    async send(message) {
      attempted.push(message.to);
      if (bounces.includes(message.to)) throw new Error(`Mailbox not found: ${message.to}`);
      return { delivered: true, messageId: `msg-${attempted.length}` };
    },
  };
}

// Like the scheduler: a job that stops is reported instead of crashing the run.
const runJob = (invoices, mailer) =>
  sendReminders(invoices, mailer, TODAY).catch((error) => ({ jobStopped: error.message }));

check('every overdue invoice gets a reminder', async () => {
  const mailer = pretendMailer();
  const report = await runJob([invoice('INV-1', 'ana@shop.example', '2026-11-20'), invoice('INV-2', 'ben@cafe.example', '2026-11-01')], mailer);
  expect(report).toEqual({ sent: ['INV-1', 'INV-2'], failed: [] });
});

check('paid invoices and ones not yet overdue are skipped', async () => {
  const mailer = pretendMailer();
  const report = await runJob([
    invoice('INV-1', 'ana@shop.example', '2026-11-20', { paid: true }),
    invoice('INV-2', 'ben@cafe.example', '2026-11-25'),
    invoice('INV-3', 'cy@farm.example', '2026-12-01'),
  ], mailer);
  expect(report).toEqual({ sent: [], failed: [] });
  expect(mailer.attempted).toEqual([]);
});

check('the subject says how late the invoice is', () => {
  expect(reminderFor(invoice('INV-7', 'ana@shop.example', '2026-11-18'), TODAY).subject).toBe('Invoice INV-7 is 7 days overdue');
});

check('a bounced address goes on the failed list', async () => {
  const mailer = pretendMailer(['billing@oldcorp.example']);
  const report = await runJob([invoice('INV-4', 'billing@oldcorp.example', '2026-11-10')], mailer);
  expect(report).toEqual({ sent: [], failed: [{ id: 'INV-4', reason: 'Mailbox not found: billing@oldcorp.example' }] });
});

check('a bounce does not stop the reminders after it', async () => {
  const mailer = pretendMailer(['billing@oldcorp.example']);
  const report = await runJob([
    invoice('INV-4', 'billing@oldcorp.example', '2026-11-10'),
    invoice('INV-5', 'dee@studio.example', '2026-11-12'),
  ], mailer);
  expect(mailer.attempted).toEqual(['billing@oldcorp.example', 'dee@studio.example']);
  expect(report.sent).toEqual(['INV-5']);
});
