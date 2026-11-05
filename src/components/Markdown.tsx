import { marked } from 'marked';
import { useMemo } from 'react';

/**
 * Renders author-written Challenge markdown (Bug Reports, Hints, Walkthroughs).
 * The source is trusted: it comes from the repo's Challenge folders, never from Learners.
 */
export function Markdown({ source, className }: { source: string; className?: string }) {
  const html = useMemo(() => marked.parse(source, { async: false }), [source]);
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
