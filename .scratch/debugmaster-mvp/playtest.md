# Playtest: DebugMaster MVP

Site: https://mtarek7900.github.io/DebugMaster/

The tests already prove each part works. This playtest answers the questions only a person can: are the Challenges fun and fair, do the Hints teach the method, and does the page feel right to work in? Allow about an hour: around 40 minutes on a desktop, 15 on a phone and 5 in a private window.

Play as a Learner. Don't open the `challenges/` folders in the repo while you play. If you already remember a bug, say so in the notes, because it skews that Challenge's results.

## 1. Desktop: play all six (≈40 min)

Use a normal browser window. Start from the Challenge list and work down it in order.

| # | Challenge | Difficulty | Solved / Gave up | Hints used | Minutes | Fun (1–5) | Fair (1–5) |
|---|-----------|------------|------------------|------------|---------|-----------|------------|
| 1 | Missing orders in My Orders | easy | | | | | |
| 2 | Expense report total is way off | easy | | | | | |
| 3 | Notification settings leak between accounts | medium | | | | | |
| 4 | Every shortcut opens the same panel | medium | | | | | |
| 5 | Search shows results for the wrong query | hard | | | | | |
| 6 | Autosave never saves | hard | | | | | |

**Fair** means you had everything you needed to find the bug from the Bug Report and the checks, without guessing what the author had in mind.

Things to notice on each Challenge:

- [ ] **Bug Report:** you could tell what was wrong before reading the code, and it didn't hint at where the bug was.
- [ ] **First Run:** at least one check failed straight away, and the failure matched the Bug Report.
- [ ] **Evidence:** the expected and actual values pointed you somewhere useful.
- [ ] **Console:** `console.log` helped, and you could read the objects and arrays it printed.
- [ ] **Hints**, if you used any: each one taught a step of the method (reproduce, read the evidence, narrow down, form a theory, fix) and didn't just hand you the fix. Write down any Hint that gave too much away or didn't help.
- [ ] **Walkthrough:** after solving, it explained the bug better than you could have, and taught you how to spot this kind of bug next time.
- [ ] **Difficulty:** the easy ones felt easy and the hard ones felt hard, but not impossible.

## 2. Desktop: try to break it (≈10 min)

Do these on any Challenge you've already finished.

- [ ] Write an infinite loop (`while (true) {}`) and Run. You should see a clear timeout message, and the tab shouldn't freeze.
- [ ] Add `throw new Error('boom')` and Run. You should see the error and where it happened.
- [ ] Hard-code the values the Visible Checks expect, then Submit. The Hidden Checks should reject it, show their names and values, and not show their code.
- [ ] On an unsolved Challenge, click Give Up and cancel. Nothing should be revealed.
- [ ] Give Up and confirm, then Submit a correct fix. The checks should pass, but the status should stay Revealed.
- [ ] Edit some code and reload the page. Your code and any revealed Hints should still be there.
- [ ] Click Reset and cancel, then Reset and confirm. Your code should go back to the Broken Code, while the status and Hint count stay the same.
- [ ] On the list page, the status and Hint counts should match what you did above.
- [ ] Try each filter on its own, both together, and a combination that matches nothing. The empty message should be clear.
- [ ] After solving a Challenge, the "Next Challenge" link should go to the right one.

## 3. Phone (≈15 min)

Pick one Challenge you haven't solved, or Reset one and try it fresh.

- [ ] The page reads in a sensible order: Bug Report, editor, Console, results.
- [ ] You can type in the editor, and the keyboard doesn't hide what you're typing.
- [ ] Run and Submit are easy to tap, and the results are easy to find after you tap.
- [ ] The Console under the editor helps on a small screen and isn't just in the way.
- [ ] Nothing scrolls sideways except the code itself.
- [ ] You could finish a Challenge here, even if it's slower than on a desktop.

## 4. Private window (≈5 min)

- [ ] Open the site in a private or incognito window. It loads, and you can Run and Submit.
- [ ] Any message about progress not being saved is clear and not alarming.

## Findings

Write down anything that annoyed, confused or delighted you, even small things. Use one line each, starting with where it happened.

-
-
-

**Afterwards:** turn each finding worth fixing into an issue at `.scratch/<feature>/issues/NN-<slug>.md` with `**Status:** needs-triage`, then we'll triage them together. Findings about Challenge content (unfair Hints, the wrong difficulty) can go in one issue per Challenge.
