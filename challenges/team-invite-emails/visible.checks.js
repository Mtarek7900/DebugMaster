check('one address on its own is invited', () => {
  expect(parseInvites('ana@acme.example')).toEqual({ invite: ['ana@acme.example'], invalid: [], skipped: [] });
});

check('text that is not an address is shown back as typed', () => {
  expect(parseInvites('Ana from sales').invalid).toEqual(['Ana from sales']);
});

check('three good addresses are all invited', () => {
  const result = parseInvites('ana@acme.example, ben@acme.example, cy@acme.example');
  expect(result).toEqual({ invite: ['ana@acme.example', 'ben@acme.example', 'cy@acme.example'], invalid: [], skipped: [] });
});

check('pasting the same thing twice gives the same result', () => {
  const first = parseInvites('dee@acme.example');
  const second = parseInvites('dee@acme.example');
  expect(second).toEqual(first);
});

check('existing members are skipped', () => {
  const result = parseInvites('Ana@Acme.example', ['ana@acme.example']);
  expect(result.skipped).toEqual(['ana@acme.example']);
  expect(result.invite).toEqual([]);
});
