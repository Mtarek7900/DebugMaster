// The product search box in the shop's header. Each keystroke starts a new
// search; the results list must always match what is in the box right now,
// so answers to searches that have since been replaced are ignored.

const MIN_QUERY_LENGTH = 2;

export function createSearchBox(searchProducts) {
  const state = { query: '', results: [], loading: false, error: null };
  let searchCount = 0;

  async function type(text) {
    state.query = text;
    const query = text.trim();
    searchCount += 1;

    if (query.length < MIN_QUERY_LENGTH) {
      state.results = [];
      state.loading = false;
      state.error = null;
      return;
    }

    state.loading = true;
    state.error = null;
    let results = [];
    let failed = false;
    try {
      results = await searchProducts(query);
    } catch {
      failed = true;
    }

    const thisSearch = searchCount;
    if (thisSearch !== searchCount) {
      return;
    }

    state.loading = false;
    state.results = failed ? [] : results;
    state.error = failed ? 'Search failed. Please try again.' : null;
  }

  return {
    type,
    view: () => ({ ...state, results: state.results.slice() }),
  };
}
