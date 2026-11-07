/**
 * The Challenge Catalog: every folder under `challenges/` becomes a Challenge at
 * build time, with no code changes per Challenge. Invalid Challenges fail loudly.
 */
import { compareChallenges, parseChallenge, validateChallenge, type Challenge } from './challenge';

export { validateChallenge } from './challenge';
export type { Challenge } from './challenge';

const rawFiles = import.meta.glob<string>('/challenges/*/*', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function loadCatalog(files: Record<string, string>): Challenge[] {
  const folders = new Map<string, Record<string, string>>();
  for (const [path, content] of Object.entries(files)) {
    const [, id, fileName] = /^\/challenges\/([^/]+)\/([^/]+)$/.exec(path) ?? [];
    if (!id) continue;
    if (!folders.has(id)) folders.set(id, {});
    folders.get(id)![fileName] = content;
  }

  const loaded = [...folders].map(([id, folderFiles]) => parseChallenge(id, folderFiles));
  const problems = loaded.flatMap((c) => validateChallenge(c).map((p) => `${c.id}: ${p}`));
  if (problems.length) {
    throw new Error(`Invalid Challenges in the catalog:\n${problems.join('\n')}`);
  }

  return loaded.sort(compareChallenges);
}

export const challenges: Challenge[] = loadCatalog(rawFiles);
