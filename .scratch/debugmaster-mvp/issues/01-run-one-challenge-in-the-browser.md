# 01: Run one Challenge in the browser

**What to build:** The thinnest end-to-end path through DebugMaster. A Learner opens the site, lands on a single Challenge page, reads its Bug Report, sees the Broken Code in a real code editor, edits it, presses Run and sees each Visible Check's name, pass or fail, and expected-versus-actual values. Behind this sit the project scaffold, the Challenge Catalog (Challenges loaded from per-Challenge folders at build time), the Check helper (`check` / `expect`), the Challenge Runner core in `run` mode, and a Web Worker adapter that runs it in the browser. Ships with the first Challenge (easy, off-by-one) and the catalog integrity suite. See the spec at `.scratch/debugmaster-mvp/spec.md` and the vocabulary in `GLOSSARY.md`.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] The project is scaffolded as a static Vite + React + TypeScript app with Vitest; `dev`, `build` and `test` scripts work
- [x] The Challenge Catalog loads every Challenge folder (metadata and Bug Report, Broken Code, Reference Fix, Visible Checks, Hidden Checks, Hints, Walkthrough) into typed Challenges without code changes per Challenge
- [x] The Check helper supports `check(name, fn)` and `expect(actual)` with at least `toBe`, `toEqual` and `toThrow`, producing readable expected-versus-actual messages
- [x] The Challenge Runner, given a Challenge, the Learner's code and `run` mode, returns per-Visible-Check results (name, passed, expected and actual on failure); it is tested in Node with Vitest
- [x] In the browser, the Runner executes inside a Web Worker via a thin adapter
- [x] The Challenge page shows the Bug Report, the Difficulty and Bug Category, a CodeMirror 6 editor preloaded with the Broken Code, a Run button and a results panel
- [x] The first Challenge exists (easy, off-by-one, realistic code, one bug, 20–80 lines, 3–5 method-ordered Hints, a Walkthrough, a Reference Fix, Visible and Hidden Checks)
- [x] The catalog integrity suite passes: for every Challenge, the Broken Code fails at least one Visible Check, the Reference Fix passes every Visible and Hidden Check, and the metadata is valid (known Difficulty and Bug Category, 3–5 Hints, non-empty Bug Report and Walkthrough)
- [x] Running the Broken Code in the browser shows at least one failing Visible Check; pasting the Reference Fix and running shows all passing

## Comments

**2026-11-05: implemented.** All acceptance criteria are met. `npm test` passes 13 tests: the Runner seam, the catalog integrity suite and the Challenge page. `typecheck` and `build` are clean. I checked the result in Chrome through the real Web Worker. The Broken Code fails 2 of 5 Visible Checks, and the Reference Fix passes all 5.

Notes for later tickets:
- Challenge folder format: `challenge.md` (frontmatter `title`, `difficulty`, `category` + the Bug Report), `broken.js`, `fix.js`, `visible.checks.js`, `hidden.checks.js`, `hints.md` (one `## <method step>` section per Hint), `walkthrough.md`. Only named exports are supported, since `loadModule` rewrites `export` so the code runs the same way in Node and in the worker.
- The Runner already returns a minimal `threw` outcome (a syntax error, or a check file throwing at top level), so a broken run never hangs the worker. 02 still owns console capture, timeouts and the full error display.
- `workerRunner` starts a fresh worker for each run and terminates it after the run, so the 02 timeout can terminate the same way.
- The review suggested adding terms to GLOSSARY.md: Challenge Catalog, Challenge Runner, Check helper, Challenge List. That's left for `/domain-modeling`.
