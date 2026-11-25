// The nightly job that emails reminders about overdue invoices. A reminder
// that can't be delivered goes on the failed list so the accounts team can
// phone the customer instead. One failure must never stop the others.

const DAY_MS = 24 * 60 * 60 * 1000;

export async function sendReminders(invoices, mailer, today) {
  const report = { sent: [], failed: [] };

  for (const invoice of invoices) {
    if (invoice.paid || daysOverdue(invoice, today) < 1) {
      continue;
    }
    const outcome = await deliver(reminderFor(invoice, today), mailer);
    if (outcome.delivered) {
      report.sent.push(invoice.id);
    } else {
      report.failed.push({ id: invoice.id, reason: outcome.reason });
    }
  }

  return report;
}

export function reminderFor(invoice, today) {
  const days = daysOverdue(invoice, today);
  return {
    to: invoice.email,
    subject: `Invoice ${invoice.id} is ${days} ${days === 1 ? 'day' : 'days'} overdue`,
    body: `Hi ${invoice.customer}, invoice ${invoice.id} for $${invoice.amount.toFixed(2)} was due on ${invoice.dueDate}.`,
  };
}

async function deliver(message, mailer) {
  try {
    return await mailer.send(message);
  } catch (error) {
    return { delivered: false, reason: error.message };
  }
}

function daysOverdue(invoice, today) {
  return Math.round((Date.parse(today) - Date.parse(invoice.dueDate)) / DAY_MS);
}
