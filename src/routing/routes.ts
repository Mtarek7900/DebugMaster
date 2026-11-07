/**
 * The site's routes, kept in the URL hash so any static host can serve every
 * page from the one index.html (no server routing needed):
 *
 *   #/                    the Challenge List (also an empty hash)
 *   #/challenges/<id>     one Challenge
 *
 * Both carry the list's filters as a query, e.g. `#/?difficulty=easy&category=async-race`,
 * so a Challenge opened from a filtered list leads back to it and on to the next match.
 */
import { toFilters, type ChallengeFilters } from '../catalog/filters';

export type Route =
  | { page: 'list'; filters: ChallengeFilters }
  | { page: 'challenge'; challengeId: string; filters: ChallengeFilters }
  | { page: 'not-found' };

export function listHref(filters: ChallengeFilters = {}): string {
  return `#/${query(filters)}`;
}

export function challengeHref(challengeId: string, filters: ChallengeFilters = {}): string {
  return `#/challenges/${encodeURIComponent(challengeId)}${query(filters)}`;
}

export function parseRoute(hash: string): Route {
  const [path, search = ''] = hash.replace(/^#/, '').split('?', 2);
  const params = new URLSearchParams(search);
  const filters = toFilters({ difficulty: params.get('difficulty'), bugCategory: params.get('category') });
  if (path === '' || path === '/') return { page: 'list', filters };
  const match = /^\/challenges\/([^/]+)\/?$/.exec(path);
  if (match) {
    try {
      return { page: 'challenge', challengeId: decodeURIComponent(match[1]), filters };
    } catch {
      // A malformed escape sequence names no Challenge.
    }
  }
  return { page: 'not-found' };
}

function query(filters: ChallengeFilters): string {
  const params = new URLSearchParams();
  if (filters.difficulty) params.set('difficulty', filters.difficulty);
  if (filters.bugCategory) params.set('category', filters.bugCategory);
  const text = params.toString();
  return text ? `?${text}` : '';
}
