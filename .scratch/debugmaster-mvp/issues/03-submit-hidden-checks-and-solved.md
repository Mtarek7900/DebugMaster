# 03: Submit, Hidden Checks and Solved

**What to build:** A Learner can submit a fix. A Submit button, separate from Run, runs every Visible and Hidden Check. A failing Hidden Check shows its name and expected-versus-actual values, never its code. When every check passes, the Challenge becomes Solved, a success message appears, and the Walkthrough opens. Solved status is saved in the browser through a new Progress Store and survives a reload. If browser storage is unavailable, the site still works; progress just isn't kept.

**Blocked by:** 01 (Run one Challenge in the browser)

**Status:** ready-for-agent

- [ ] The Runner supports `submit` mode, returning Visible and Hidden Check results, each marked Visible or Hidden; covered by Node tests
- [ ] The Challenge page has a Submit button distinct from Run; Run still reports only Visible Checks
- [ ] Failed Hidden Checks show name and expected/actual values, but not their code
- [ ] When every check passes on Submit, the page shows a success message and opens the Walkthrough
- [ ] The Progress Store records per-Challenge status (`unattempted | solved | revealed`); Solved persists across a reload
- [ ] All storage access fails gracefully; with storage throwing, the page still runs, submits and shows Solved for the session
- [ ] The Challenge page accepts the Runner as a dependency; page-level tests (React Testing Library, fake Runner) cover Submit → Solved → Walkthrough, Hidden Check failure display, persistence across remount, and storage throwing
- [ ] The Walkthrough is not visible before the Challenge is Solved
