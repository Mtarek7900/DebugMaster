const TODAY = '2026-11-25';
const invoice = (id, email, dueDate, extra = {}) => ({ id, email, dueDate, customer: 'Lee', amount: 75.5, paid: false, ...extra });

function pretendMailer(bounces = []) {
  const attempted = [];
  return {
    attempted,
    async send(message) {
      attempted.push(message.to);
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (bounces.includes(message.to)) throw new Error(`550 Mailbox unavailable: ${message.to}`);
      return { delivered: true, messageId: `msg-${attempted.length}` };
    },
  };
}

const runJob = (invoices, mailer) =>
  sendReminders(invoices, mailer, TODAY).catch((error) => ({ jobStopped: error.message }));

check('a bounce in the middle of the night is recorded and the job carries on', async () => {
  const mailer = pretendMailer(['b@two.example']);
  const report = await runJob([
    invoice('A', 'a@one.example', '2026-11-01'),
    invoice('B', 'b@two.example', '2026-11-02'),
    invoice('C', 'c@three.example', '2026-11-03'),
  ], mailer);
  expect(report).toEqual({ sent: ['A', 'C'], failed: [{ id: 'B', reason: '550 Mailbox unavailable: b@two.example' }] });
});

check('when every address bounces, every invoice is on the failed list', async () => {
  const mailer = pretendMailer(['a@one.example', 'b@two.example']);
  const report = await runJob([invoice('A', 'a@one.example', '2026-11-01'), invoice('B', 'b@two.example', '2026-11-02')], mailer);
  expect(report.sent).toEqual([]);
  expect(report.failed.map((entry) => entry.id)).toEqual(['A', 'B']);
});

check('a mailer that refuses a message straight away is handled the same way', async () => {
  const strictMailer = {
    send(message) {
      if (!message.to.includes('@')) throw new Error(`Not an email address: ${message.to}`);
      return Promise.resolve({ delivered: true, messageId: 'msg-1' });
    },
  };
  const report = await runJob([invoice('A', 'nobody', '2026-11-01'), invoice('B', 'b@two.example', '2026-11-02')], strictMailer);
  expect(report).toEqual({ sent: ['B'], failed: [{ id: 'A', reason: 'Not an email address: nobody' }] });
});

check('one day late says "1 day"', () => {
  expect(reminderFor(invoice('A', 'a@one.example', '2026-11-24'), TODAY).subject).toBe('Invoice A is 1 day overdue');
});

check('the reminder names the customer and the amount', () => {
  expect(reminderFor(invoice('A', 'a@one.example', '2026-11-24'), TODAY).body).toBe('Hi Lee, invoice A for $75.50 was due on 2026-11-24.');
});

check('no overdue invoices means an empty report', async () => {
  expect(await runJob([], pretendMailer())).toEqual({ sent: [], failed: [] });
});
