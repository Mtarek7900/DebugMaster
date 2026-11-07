const PRODUCTS = ['desk', 'desk lamp', 'desk chair', 'chair', 'armchair', 'lamp', 'phone charger', 'chalk'];
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

function pretendSearchService() {
  const waiting = [];
  const take = (query) => {
    const index = waiting.findIndex((search) => search.query === query);
    return waiting.splice(index, 1)[0];
  };
  return {
    searchProducts: (query) => new Promise((resolve, reject) => waiting.push({ query, resolve, reject })),
    async answer(query) {
      take(query).resolve(PRODUCTS.filter((name) => name.includes(query)));
      await settle();
    },
    async fail(query) {
      take(query).reject(new Error('503 Service Unavailable'));
      await settle();
    },
  };
}

check('only the newest of three searches shows, whatever order the answers arrive in', async () => {
  const service = pretendSearchService();
  const box = createSearchBox(service.searchProducts);
  box.type('ch');
  box.type('cha');
  box.type('chair');
  await service.answer('chair');
  await service.answer('ch');
  await service.answer('cha');
  expect(box.view()).toEqual({ query: 'chair', results: ['desk chair', 'chair', 'armchair'], loading: false, error: null });
});

check('clearing the box ignores a search still running', async () => {
  const service = pretendSearchService();
  const box = createSearchBox(service.searchProducts);
  box.type('desk');
  box.type('');
  await service.answer('desk');
  expect(box.view()).toEqual({ query: '', results: [], loading: false, error: null });
});

check('an older search that fails does not show an error over newer results', async () => {
  const service = pretendSearchService();
  const box = createSearchBox(service.searchProducts);
  box.type('la');
  box.type('lamp');
  await service.answer('lamp');
  await service.fail('la');
  expect(box.view().error).toBe(null);
  expect(box.view().results).toEqual(['desk lamp', 'lamp']);
});

check('a failed newest search shows an error', async () => {
  const service = pretendSearchService();
  const box = createSearchBox(service.searchProducts);
  box.type('desk');
  await service.fail('desk');
  expect(box.view()).toEqual({ query: 'desk', results: [], loading: false, error: 'Search failed. Please try again.' });
});

check('going back to earlier text is not undone by a late answer', async () => {
  const service = pretendSearchService();
  const box = createSearchBox(service.searchProducts);
  box.type('desk');
  box.type('desk lamp');
  box.type('desk');
  await service.answer('desk');
  await service.answer('desk');
  await service.answer('desk lamp');
  expect(box.view()).toEqual({ query: 'desk', results: ['desk', 'desk lamp', 'desk chair'], loading: false, error: null });
});
