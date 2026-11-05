import { challenges } from './catalog/catalog';
import { ChallengePage } from './pages/ChallengePage';
import { workerRunner } from './runner/workerRunner';

export function App() {
  // Until the Challenge List page exists, the site opens straight onto the first Challenge.
  const challenge = challenges[0];
  return (
    <>
      <header className="site-header">
        <span className="brand">DebugMaster</span>
      </header>
      <ChallengePage key={challenge.id} challenge={challenge} runner={workerRunner} />
    </>
  );
}
