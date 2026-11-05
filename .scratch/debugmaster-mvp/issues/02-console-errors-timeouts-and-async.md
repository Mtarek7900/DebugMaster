# 02: Console, errors, timeouts and async code

**What to build:** The Learner can debug like they would for real. `console.log` output from their code appears in a console panel on the Challenge page (objects and arrays readable). If their code throws, they see the error message instead of a silent failure. If it runs too long (for example an infinite loop) it is stopped after about 3 seconds with a clear "timed out" message, and the tab never freezes. Async checks (promises, timers) are awaited correctly.

**Blocked by:** 01 (Run one Challenge in the browser)

**Status:** ready-for-agent

- [ ] The Runner result includes captured console output, in order, with objects and arrays formatted readably
- [ ] The Runner result reports a "threw" outcome with the error message when the Learner's code or a check throws
- [ ] The Runner reports a "timed out" outcome for code that runs past the time limit (about 3 seconds); in the browser the worker is terminated and a fresh one is used for the next Run
- [ ] Async checks are awaited, and async failures are reported like synchronous ones
- [ ] Runner tests in Node cover console capture, thrown errors, timeouts (the core runs in a worker thread or equivalent with a time limit) and async checks
- [ ] The Challenge page shows a console panel and displays thrown-error and timed-out outcomes clearly
