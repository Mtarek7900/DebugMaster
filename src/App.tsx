import { useEffect, useState } from 'react';
import { challenges as catalog } from './catalog/catalog';
import type { Challenge } from './catalog/challenge';
import { nextChallenge } from './catalog/filters';
import { ChallengeListPage } from './pages/ChallengeListPage';
import { ChallengePage } from './pages/ChallengePage';
import { browserProgressStore, type ProgressStore } from './progress/progressStore';
import { listHref, parseRoute, type Route } from './routing/routes';
import type { Runner } from './runner/runner';
import { workerRunner } from './runner/workerRunner';

interface AppProps {
  /** The Challenges in list order; the Challenge Catalog by default. */
  challenges?: Challenge[];
  runner?: Runner;
  progress?: ProgressStore;
}

export function App({ challenges = catalog, runner = workerRunner, progress = browserProgressStore }: AppProps) {
  const [route, replaceRoute] = useHashRoute();
  return (
    <>
      <header className="site-header">
        <a className="brand" href={listHref()}>
          DebugMaster
        </a>
      </header>
      <Page route={route} replaceRoute={replaceRoute} challenges={challenges} runner={runner} progress={progress} />
    </>
  );
}

interface PageProps {
  route: Route;
  replaceRoute: (href: string) => void;
  challenges: Challenge[];
  runner: Runner;
  progress: ProgressStore;
}

function Page({ route, replaceRoute, challenges, runner, progress }: PageProps) {
  if (route.page === 'list') {
    return (
      <ChallengeListPage
        challenges={challenges}
        progress={progress}
        filters={route.filters}
        // Changing a filter rewrites the address rather than adding a history entry, so Back leaves the list.
        onFiltersChange={(filters) => replaceRoute(listHref(filters))}
      />
    );
  }

  const challenge = route.page === 'challenge' ? challenges.find((c) => c.id === route.challengeId) : undefined;
  if (route.page === 'not-found' || !challenge) {
    return (
      <main className="not-found">
        <h1>Challenge not found</h1>
        <p>
          There is no Challenge at this address. <a href={listHref()}>Browse all Challenges</a>.
        </p>
      </main>
    );
  }
  return (
    <ChallengePage
      // A fresh page per Challenge, so no state carries over between them.
      key={challenge.id}
      challenge={challenge}
      runner={runner}
      progress={progress}
      filters={route.filters}
      nextChallenge={nextChallenge(challenges, challenge.id, route.filters)}
    />
  );
}

/**
 * The current route, following the URL hash as the Learner navigates, and a way
 * to replace the address in place (no new history entry, no scroll).
 */
function useHashRoute(): [Route, (href: string) => void] {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  useEffect(() => {
    function onHashChange() {
      setRoute(parseRoute(window.location.hash));
      // Hash routes match no element, so the browser would otherwise keep the old scroll position.
      window.scrollTo(0, 0);
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  function replaceRoute(href: string) {
    // replaceState fires no hashchange, so the route is set here.
    window.history.replaceState(window.history.state, '', href);
    setRoute(parseRoute(href));
  }
  return [route, replaceRoute];
}
