# Hidden Checks run in the browser

Learner code and all checks run client-side in a Web Worker, so the Hidden Checks ship in the static bundle and a determined Learner can read them in devtools. We accept this for the MVP: DebugMaster is a practice site where cheating only cheats yourself, and running in the browser lets us ship with no backend, no execution sandbox to secure, and free static hosting.

## Consequences

- Hidden Checks guard against accidental over-fitting to the Visible Checks, not against deliberate cheating.
- If Solved ever carries weight beyond self-practice (leaderboards, certificates), Hidden Checks must move to server-side execution, and this ADR should be superseded.
