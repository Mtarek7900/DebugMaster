# Spec: DebugMaster MVP

Status: ready-for-agent

## Problem Statement

Developers get stuck on bugs that look hard, and most never learn a repeatable way to work through them. They learn debugging by accident, on real code, under real pressure, usually by trial and error or by being handed the answer. There is nowhere to practise debugging deliberately on realistic code, with guidance that teaches the *method* (reproduce, read the evidence, narrow down, form a theory, fix) step by step, instead of just revealing what was wrong.

## Solution

DebugMaster is a website with a catalog of **Challenges**. Each Challenge gives the Learner a symptom-first **Bug Report** and a piece of realistic **Broken Code** containing exactly one bug. The Learner edits the code in the browser, runs it, watches the console and the **Visible Checks**, and submits a fix that must also pass the **Hidden Checks** before the Challenge counts as **Solved**. When stuck, the Learner can reveal **Hints** one at a time, each teaching the next step of the debugging method. Once the attempt is over, by solving or by giving up (which marks the Challenge **Revealed**), the **Walkthrough** explains how to diagnose and fix the bug from start to finish.

The MVP is a static site with no accounts. It ships with 6 hand-written JavaScript Challenges, and progress is kept in the Learner's browser.

## User Stories

### Browsing Challenges

1. As a Learner, I want to see a list of all Challenges, so that I can pick one to practise.
2. As a Learner, I want each Challenge in the list to show its title, Difficulty and Bug Category, so that I can choose something at my level.
3. As a Learner, I want to filter the list by Difficulty, so that I can stick to Challenges I'm ready for.
4. As a Learner, I want to filter the list by Bug Category, so that I can drill one kind of bug repeatedly.
5. As a Learner, I want to combine the Difficulty and Bug Category filters, so that I can narrow the list precisely.
6. As a Learner, I want to see which Challenges I have Solved, so that I know what I've already mastered.
7. As a Learner, I want to see which Challenges I have Revealed, so that I know which ones are worth retrying honestly later.
8. As a Learner, I want to see how many Hints I used on each Solved Challenge, so that I can track my growing independence.
9. As a Learner, I want the list ordered from easy to hard, so that there's a natural path through the catalog.
10. As a Learner, I want a clear message when my filters match no Challenges, so that I don't think the site is broken.

### Starting a Challenge

11. As a Learner, I want to read a Bug Report describing the symptom and how to reproduce it, so that I start the way real debugging starts: from a symptom, not a known location.
12. As a Learner, I want the Bug Report to never tell me where the bug is, so that finding it is my job.
13. As a Learner, I want to see the Broken Code in a proper code editor with syntax highlighting and line numbers, so that it feels like real code.
14. As a Learner, I want the Broken Code to look like realistic application code, so that the skill transfers to my actual work.
15. As a Learner, I want to see the Challenge's Difficulty and Bug Category on the Challenge page, so that I know what I'm getting into. (The Bug Category is shown as a label; it does not point at the bug's location.)

### Running and exploring

16. As a Learner, I want to edit the Broken Code freely, so that I can experiment with fixes and add instrumentation.
17. As a Learner, I want a Run button that runs the Visible Checks against my current code, so that I can reproduce the bug and test theories.
18. As a Learner, I want at least one Visible Check to fail at the start, so that I can reproduce the Bug Report immediately.
19. As a Learner, I want each check result to show its name, whether it passed, and the expected and actual values when it failed, so that I can read the evidence.
20. As a Learner, I want to add `console.log` calls and see their output in a console panel, so that I can inspect values like I would in real debugging.
21. As a Learner, I want to see logged objects and arrays in a readable form, so that the console is actually useful.
22. As a Learner, I want to see the error message and where it happened when my code throws, so that I can debug crashes as well as wrong results.
23. As a Learner, I want my code to be stopped with a clear "timed out" message if it runs too long (such as an infinite loop), so that my browser tab doesn't freeze.
24. As a Learner, I want to Run as many times as I like without any penalty, so that I feel free to experiment.
25. As a Learner, I want async code (promises, timers) to run correctly, so that Challenges about async races work like real code.

### Hints

26. As a Learner, I want to reveal Hints one at a time, so that I get only as much help as I need.
27. As a Learner, I want Hints to be revealed in a fixed order, so that they walk me through the debugging method step by step.
28. As a Learner, I want each Hint to teach a step of the method (for example "what does the failing check's actual value tell you?") rather than give away the fix, so that I learn how to debug, not just this bug.
29. As a Learner, I want previously revealed Hints to stay visible, so that I can re-read them.
30. As a Learner, I want to see how many Hints remain, so that I know how much help is left.
31. As a Learner, I want using Hints to carry no score penalty, so that I'm not discouraged from asking for help.
32. As a Learner, I want my revealed Hints remembered if I leave and come back, so that I don't lose my place.

### Submitting and solving

33. As a Learner, I want a separate Submit button that runs all Visible and Hidden Checks, so that submitting is a deliberate act distinct from exploring.
34. As a Learner, I want a failing Hidden Check to show its name and its expected and actual values but not its code, so that I know what behaviour is still wrong without being handed the answer.
35. As a Learner, I want the Challenge marked Solved when every check passes, so that my progress is recorded.
36. As a Learner, I want a success message stating how many Hints I used, so that I get honest feedback on my independence.
37. As a Learner, I want the Walkthrough to open when I solve a Challenge, so that I can compare my reasoning with the intended method.
38. As a Learner, I want a "Next Challenge" link after solving, so that I can keep going.
39. As a Learner, I want a fix that only satisfies the Visible Checks (for example by hard-coding expected values) to be rejected by the Hidden Checks, so that Solved means I really fixed the bug.

### Giving up

40. As a Learner, I want a Give Up button, so that I can see the answer when I'm truly stuck.
41. As a Learner, I want Give Up to ask for confirmation, so that I don't reveal the Walkthrough by accident.
42. As a Learner, I want Give Up to open the Walkthrough and mark the Challenge Revealed, so that I can learn from it while my record stays honest.
43. As a Learner, I want to keep editing and submitting after giving up, so that I can still practise applying the fix.
44. As a Learner, I want a Revealed Challenge to stay Revealed even if I later pass all checks, so that Solved always means solved unaided by the Walkthrough.

### Persistence

45. As a Learner, I want my code for each Challenge saved automatically as I type, so that a page refresh doesn't lose my work.
46. As a Learner, I want a Reset button that restores the original Broken Code, so that I can start over cleanly.
47. As a Learner, I want Reset to ask for confirmation, so that I don't lose my edits by accident.
48. As a Learner, I want Reset to leave my Solved/Revealed status and Hint count unchanged, so that resetting code doesn't rewrite my history.
49. As a Learner, I want my progress kept between visits without creating an account, so that I can start practising immediately.
50. As a Learner, I want the site to keep working if browser storage is unavailable (private mode, blocked storage), so that I can still practise even if progress isn't saved.

### Walkthrough

51. As a Learner, I want the Walkthrough to explain the diagnosis step by step, following the same method as the Hints, so that the method sticks.
52. As a Learner, I want the Walkthrough to explain why the bug happened and how to recognise this Bug Category in future, so that I can generalise the lesson.
53. As a Learner, I want the Walkthrough hidden until I've Solved or given up, so that I'm not tempted to peek.

### Devices

54. As a Learner on a desktop, I want the Bug Report, editor, results and Hints laid out side by side, so that I can see everything while I work.
55. As a Learner on a phone, I want the page stacked in a usable order (Bug Report, editor, results), so that I can still try a Challenge, even if it's not polished.

### Challenge authors

56. As a Challenge author, I want each Challenge to be one self-contained folder of plain files (metadata and Bug Report, Broken Code, Reference Fix, Visible Checks, Hidden Checks, Hints, Walkthrough), so that writing a new Challenge needs no code changes.
57. As a Challenge author, I want to write checks with a small, familiar `check` / `expect` style, so that checks are quick to write and read.
58. As a Challenge author, I want an automated test that fails if any Challenge's Broken Code passes all its Visible Checks, so that every Challenge actually reproduces its bug.
59. As a Challenge author, I want an automated test that fails if any Challenge's Reference Fix fails any check, so that every Challenge is provably solvable and its checks are sound.
60. As a Challenge author, I want the automated tests to check that each Challenge's metadata is complete and valid (a known Difficulty and Bug Category, 3–5 Hints, a non-empty Walkthrough), so that malformed Challenges never ship.
61. As a Challenge author, I want new Challenge folders picked up by the site automatically, so that adding content is just adding files.

### Initial catalog

62. As a Learner, I want 6 launch Challenges, 2 easy, 2 medium and 2 hard, each in a different Bug Category (off-by-one, type coercion, shared-object mutation, closure in a loop, async race, `this` binding), so that there's a meaningful spread from day one.

## Implementation Decisions

### Architecture

- A static single-page app built with Vite, React and TypeScript. No backend; it deploys to any static host.
- CodeMirror 6 is the code editor, chosen over Monaco for its much smaller size and better mobile behaviour.
- Learner code and all checks run client-side. Hidden Checks therefore ship in the static bundle and are readable by a determined Learner; this is accepted (see ADR-0001).
- Challenges are JavaScript only in the MVP.

### Modules

- **Challenge Catalog**: loads every Challenge folder at build time (via bundler glob imports) into a typed list of Challenges. Each Challenge has: an id (its folder name), title, Difficulty (`easy | medium | hard`), Bug Category, Bug Report, Broken Code, Reference Fix, Visible Checks, Hidden Checks, an ordered list of Hints, and a Walkthrough. Validates metadata when loaded.
- **Challenge Runner**: the core testing seam. Its interface is roughly: given a Challenge, the Learner's code and a mode (`run` = Visible Checks only; `submit` = Visible and Hidden), it returns a result containing each check's name, whether it is Visible or Hidden, passed or failed, and the expected and actual values on failure; the captured console output; and an outcome of completed, threw (with the error message) or timed out. The core is plain TypeScript that runs in Node for testing.
- **Worker adapter**: a thin Web Worker wrapper around the Runner core for the browser. It enforces a time limit of about 3 seconds by terminating the worker and reports a timeout. It supports async checks.
- **Check helper**: a small built-in `check(name, fn)` / `expect(actual)` API (around `toBe`, `toEqual`, `toThrow`, and async support) used by Challenge check files. It formats readable expected-versus-actual messages. No external test framework is bundled.
- **Progress Store**: per-Challenge state kept in localStorage: the Learner's current code, Hints revealed (count), and status (`unattempted | solved | revealed`). Rules: Solved is set only when a Submit passes every check and the status is not already Revealed; Revealed is permanent once set; Reset changes only the saved code. All storage access fails gracefully, and the app works without persistence.
- **Challenge List page**: renders the catalog ordered by Difficulty, with Difficulty and Bug Category filters and each Challenge's status and Hint count.
- **Challenge page**: Bug Report, editor, Run, Submit, results panel, console panel, Hint ladder, Give Up (with confirmation), Reset (with confirmation), and the Walkthrough (opened on Solved or Revealed), plus a "Next Challenge" link after solving. It receives the Runner as a dependency so tests can inject a fake.

### Challenge authoring format

- Each Challenge is one folder containing: metadata and the Bug Report (frontmatter plus markdown), the Broken Code, the Reference Fix, the Visible Checks, the Hidden Checks, the Hints (ordered, 3–5) and the Walkthrough (markdown).
- The Broken Code and the Reference Fix expose the same exports; check files exercise those exports.
- The Reference Fix is never shown to the Learner.
- Each Challenge has exactly one bug, in one file of roughly 20–80 lines, written as realistic application code.

### Hint design

- Hints follow the debugging method in order: reproduce → read the evidence → narrow down → form a theory → fix. The last Hint may point closely at the fix, but earlier ones must teach the method.

## Testing Decisions

- **What makes a good test**: tests exercise external behaviour through one of the two agreed seams, never internal helpers directly. They assert what a Learner would observe (check results, console output, on-screen text, persisted status), not implementation details.
- **Seam 1: Challenge Runner (Vitest, Node)**:
  - Run mode reports only Visible Checks; Submit mode reports Visible and Hidden.
  - Failed checks report expected and actual values.
  - Console output is captured in order.
  - Thrown errors are reported with their message.
  - Async checks are awaited.
  - Infinite loops are reported as timed out. In Node this is achieved by running the core in a worker thread (or an equivalent mechanism) with a time limit, mirroring the browser adapter.
  - **Catalog integrity suite**: for every Challenge in the catalog, its Broken Code fails at least one Visible Check, its Reference Fix passes every Visible and Hidden Check, and its metadata is valid (a known Difficulty and Bug Category, 3–5 Hints, a non-empty Walkthrough and Bug Report).
- **Seam 2: pages (Vitest + React Testing Library, jsdom)**, with a fake Runner injected and storage reset between tests:
  - The Challenge page covers: Run shows results and console; Submit with all checks passing marks Solved, shows the Hint count and opens the Walkthrough; a failed Hidden Check shows its name and values; Hints reveal in order and the count persists; Give Up (confirmed) opens the Walkthrough and marks Revealed; Solved after Revealed stays Revealed; Reset (confirmed) restores the Broken Code without changing status; edits persist across remounts; the page works when storage throws.
  - The Challenge List page covers: Difficulty and Bug Category filters (alone and combined); the empty-filter message; status and Hint count shown per Challenge.
- **Prior art**: none. This is a new repository, and these tests establish the patterns.

## Out of Scope

- User accounts, sign-in, server-side progress and syncing across devices.
- Server-side code execution or tamper-proof Hidden Checks.
- Languages other than JavaScript (TypeScript, Python, and so on).
- LLM-generated Challenges, whether live or assisted.
- Challenges with multiple bugs or multiple files.
- Scoring, points, leaderboards, streaks and certificates.
- Landing or marketing pages, and an about page.
- A polished mobile experience (it only needs to be usable).
- Learner-written tests, step-through debuggers and breakpoints.
- Authoring tools or a Challenge editor UI (Challenges are written as files in the repo).

## Further Notes

- The MVP is deliberately shaped so later growth fits without a rewrite: new Challenges are just folders; a backend for accounts can wrap the Progress Store; the Reference Fix and catalog integrity suite are the safety net that would make LLM-assisted Challenge generation trustworthy; and ADR-0001 names what must change if Solved ever needs to be tamper-proof.
- The domain vocabulary is defined in `GLOSSARY.md`; use those terms in code, UI copy and tickets.
- The project directory is not yet a git repository. Run `git init` before implementation so `/code-review` and `/prototype` work.
