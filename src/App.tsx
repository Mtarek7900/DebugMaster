import { useEffect, useState } from 'react';
import { challenges } from './catalog/catalog';
import { ChallengeListPage } from './pages/ChallengeListPage';
import { ChallengePage } from './pages/ChallengePage';
import { LIST_HREF, parseRoute, type Route } from './routing/routes';
import { workerRunner } from './runner/workerRunner';

export function App() {
  const route = useHashRoute();
  return (
    <>
      <header className="site-header">
        <a className="brand" href={LIST_HREF}>
          DebugMaster
        </a>
      </header>
      <Page route={route} />
    </>
  );
}

function Page({ route }: { route: Route }) {
  if (route.page === 'list') return <ChallengeListPage challenges={challenges} />;

  // The catalog is already in list order, so the next Challenge is the next entry.
  const index = route.page === 'challenge' ? challenges.findIndex((c) => c.id === route.challengeId) : -1;
  if (index === -1) {
    return (
      <main className="not-found">
        <h1>Challenge not found</h1>
        <p>
          There is no Challenge at this address. <a href={LIST_HREF}>Browse all Challenges</a>.
        </p>
      </main>
    );
  }
  const challenge = challenges[index];
  return (
    <ChallengePage
      // A fresh page per Challenge, so no state carries over between them.
      key={challenge.id}
      challenge={challenge}
      runner={workerRunner}
      nextChallenge={challenges[index + 1]}
    />
  );
}

/** The current route, following the URL hash as the Learner navigates. */
function useHashRoute(): Route {
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
  return route;
}
