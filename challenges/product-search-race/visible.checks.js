// A pretend search service: each search waits until the check calls answer(query).
const PRODUCTS = ['laptop', 'laptop stand', 'lamp', 'desk lamp', 'lapel pin'];
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

function pretendSearchService() {
  const waiting = [];
  return {
    searchProducts: (query) => new Promise((resolve) => waiting.push({ query, resolve })),
    async answer(query) {
      const index = waiting.findIndex((search) => search.query === query);
      if (index === -1) throw new Error(`No search for "${query}" is waiting`);
      const [search] = waiting.splice(index, 1);
      search.resolve(PRODUCTS.filter((name) => name.includes(query)));
      await settle();
    },
  };
}

check('a search shows the matching products', async () => {
  const service = pretendSearchService();
  const box = createSearchBox(service.searchProducts);
  box.type('lap');
  await service.answer('lap');
  expect(box.view().results).toEqual(['laptop', 'laptop stand', 'lapel pin']);
});

check('answers in order show the results for the newest text', async () => {
  const service = pretendSearchService();
  const box = createSearchBox(service.searchProducts);
  box.type('lap');
  box.type('laptop');
  await service.answer('lap');
  await service.answer('laptop');
  expect(box.view().results).toEqual(['laptop', 'laptop stand']);
});

check('a slow answer for older text does not replace newer results', async () => {
  const service = pretendSearchService();
  const box = createSearchBox(service.searchProducts);
  box.type('lap');
  box.type('laptop');
  await service.answer('laptop');
  await service.answer('lap');
  expect(box.view().results).toEqual(['laptop', 'laptop stand']);
});

check('the box keeps loading until the newest search answers', async () => {
  const service = pretendSearchService();
  const box = createSearchBox(service.searchProducts);
  box.type('lam');
  box.type('lamp');
  await service.answer('lam');
  expect(box.view().loading).toBe(true);
  expect(box.view().results).toEqual([]);
});

check('one letter shows no results and no spinner', async () => {
  const service = pretendSearchService();
  const box = createSearchBox(service.searchProducts);
  box.type('l');
  await settle();
  expect(box.view()).toEqual({ query: 'l', results: [], loading: false, error: null });
});
