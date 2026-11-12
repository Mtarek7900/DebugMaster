# 07: Challenge list page

**What to build:** The Learner can browse the whole catalog. The list page shows every Challenge, ordered easy → medium → hard, with title, Difficulty, Bug Category, status (Solved / Revealed / not started) and, for Solved Challenges, the Hint count. Filters for Difficulty and Bug Category work alone or together, with a clear message when nothing matches. Each entry links to its Challenge page, and after solving, the Challenge page offers a "Next Challenge" link.

**Blocked by:** 04 (Hints), 05 (Give Up and Revealed)

**Status:** done

- [x] The site has a list route (the home page) and a Challenge route per Challenge id; navigation works on a static host (no server routing needed)
- [x] The list is ordered by Difficulty and shows title, Difficulty, Bug Category, status and the Hint count on Solved
- [x] Difficulty and Bug Category filters work individually and combined; an empty result shows a friendly message
- [x] The Challenge page links back to the list
- [x] After Solved (and, by later decision, after Revealed), a "Next Challenge" link goes to the next Challenge in list order (hidden on the last one)
- [x] Page-level tests cover ordering, each filter, combined filters, the empty message, and status/Hint-count display
