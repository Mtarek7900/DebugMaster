/**
 * The site's routes, kept in the URL hash so any static host can serve every
 * page from the one index.html (no server routing needed):
 *
 *   #/                    the Challenge List (also an empty hash)
 *   #/challenges/<id>     one Challenge
 */

export type Route = { page: 'list' } | { page: 'challenge'; challengeId: string } | { page: 'not-found' };

export const LIST_HREF = '#/';

export function challengeHref(challengeId: string): string {
  return `#/challenges/${encodeURIComponent(challengeId)}`;
}

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '');
  if (path === '' || path === '/') return { page: 'list' };
  const match = /^\/challenges\/([^/]+)\/?$/.exec(path);
  if (match) {
    try {
      return { page: 'challenge', challengeId: decodeURIComponent(match[1]) };
    } catch {
      // A malformed escape sequence names no Challenge.
    }
  }
  return { page: 'not-found' };
}
