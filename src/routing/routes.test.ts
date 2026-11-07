import { describe, expect, it } from 'vitest';
import { challengeHref, listHref, parseRoute } from './routes';

describe('parseRoute', () => {
  it('reads an empty hash and #/ as the unfiltered list', () => {
    expect(parseRoute('')).toEqual({ page: 'list', filters: {} });
    expect(parseRoute('#')).toEqual({ page: 'list', filters: {} });
    expect(parseRoute('#/')).toEqual({ page: 'list', filters: {} });
  });

  it('reads the list filters', () => {
    expect(parseRoute('#/?difficulty=easy&category=async-race')).toEqual({
      page: 'list',
      filters: { difficulty: 'easy', bugCategory: 'async-race' },
    });
  });

  it('treats an unknown filter value as All', () => {
    expect(parseRoute('#/?difficulty=extreme&category=async-race')).toEqual({
      page: 'list',
      filters: { bugCategory: 'async-race' },
    });
    expect(parseRoute('#/?category=nonsense')).toEqual({ page: 'list', filters: {} });
  });

  it('reads a Challenge route with the filters it was opened under', () => {
    expect(parseRoute('#/challenges/cart-total')).toEqual({ page: 'challenge', challengeId: 'cart-total', filters: {} });
    expect(parseRoute('#/challenges/cart-total?difficulty=hard')).toEqual({
      page: 'challenge',
      challengeId: 'cart-total',
      filters: { difficulty: 'hard' },
    });
  });

  it('treats anything else as not found', () => {
    expect(parseRoute('#/nowhere')).toEqual({ page: 'not-found' });
    expect(parseRoute('#/challenges/')).toEqual({ page: 'not-found' });
    expect(parseRoute('#/challenges/%E0%A4%A')).toEqual({ page: 'not-found' });
  });
});

describe('hrefs', () => {
  it('round-trip through parseRoute', () => {
    const filters = { difficulty: 'medium', bugCategory: 'this-binding' } as const;
    expect(parseRoute(listHref(filters))).toEqual({ page: 'list', filters });
    expect(parseRoute(challengeHref('cart-total', filters))).toEqual({
      page: 'challenge',
      challengeId: 'cart-total',
      filters,
    });
  });

  it('leave out the query when no filter is set', () => {
    expect(listHref({})).toBe('#/');
    expect(challengeHref('cart-total')).toBe('#/challenges/cart-total');
  });
});
