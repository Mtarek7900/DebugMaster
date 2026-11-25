check('a long pasted list invites everyone', () => {
  const people = ['ana', 'ben', 'cy', 'dee', 'eli', 'fay', 'gus', 'hal'].map((name) => `${name}@acme.example`);
  expect(parseInvites(people.join('\n')).invite).toEqual(people);
});

check('the single-address field accepts the same address every time', () => {
  const answers = [1, 2, 3, 4].map(() => isValidEmail('ana@acme.example'));
  expect(answers).toEqual([true, true, true, true]);
});

check('a good address straight after a bad one is invited', () => {
  expect(parseInvites('not an address, ben@acme.example, also wrong; cy@acme.example')).toEqual({
    invite: ['ben@acme.example', 'cy@acme.example'],
    invalid: ['not an address', 'also wrong'],
    skipped: [],
  });
});

check('upper-case addresses are invited once, lower-cased', () => {
  expect(parseInvites('Ben@Acme.Example, ben@acme.example, BEN@ACME.EXAMPLE').invite).toEqual(['ben@acme.example']);
});

check('blank lines and doubled separators are ignored', () => {
  expect(parseInvites('ana@acme.example,,\n\n; ben@acme.example;')).toEqual({
    invite: ['ana@acme.example', 'ben@acme.example'],
    invalid: [],
    skipped: [],
  });
});

check('addresses without a proper domain are invalid', () => {
  expect(parseInvites('ana@acme, @acme.example, ana@acme.x').invalid).toEqual(['ana@acme', '@acme.example', 'ana@acme.x']);
});

check('more than 50 invites at once is refused', () => {
  const many = Array.from({ length: 51 }, (_, i) => `person${i}@acme.example`).join(',');
  expect(() => parseInvites(many)).toThrow('at most 50');
});
