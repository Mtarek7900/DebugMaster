// The "Invite your team" form. Admins paste addresses separated by commas,
// semicolons or new lines. Valid ones are invited; anything else is shown back
// so it can be corrected; existing members are skipped.

const EMAIL = /^[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}$/i;
const SEPARATORS = /[,;\n]+/g;
const MAX_INVITES = 50;

export function isValidEmail(address) {
  return EMAIL.test(address.trim());
}

export function parseInvites(text, members = []) {
  const memberSet = new Set(members.map((address) => address.toLowerCase()));
  const invite = [];
  const invalid = [];
  const skipped = [];

  for (const piece of text.split(SEPARATORS)) {
    const address = piece.trim();
    if (!address) continue;

    if (!isValidEmail(address)) {
      invalid.push(address);
      continue;
    }
    const normalized = address.toLowerCase();
    if (memberSet.has(normalized)) {
      skipped.push(normalized);
    } else if (!invite.includes(normalized)) {
      invite.push(normalized);
    }
  }

  if (invite.length > MAX_INVITES) {
    throw new RangeError(`You can invite at most ${MAX_INVITES} people at once`);
  }
  return { invite, invalid, skipped };
}
