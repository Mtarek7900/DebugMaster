# 04: Hints

**What to build:** A stuck Learner can reveal Hints one at a time, in the author's order, each teaching the next step of the debugging method. Revealed Hints stay visible, the page shows how many remain, and the count is saved per Challenge so the Learner keeps their place after a reload. Using Hints carries no penalty, but the success message reports the count ("Solved with 2 Hints", or "Solved with no Hints").

**Blocked by:** 03 (Submit, Hidden Checks and Solved)

**Status:** ready-for-agent

- [ ] The Challenge page shows a Hint ladder: a "Reveal next Hint" control and the Hints revealed so far, in order
- [ ] The page shows how many Hints remain; the control is disabled once all are revealed
- [ ] The number of Hints revealed is stored per Challenge in the Progress Store and restored on reload
- [ ] The success message on Solved states the Hint count
- [ ] Page-level tests cover in-order reveal, the remaining count, persistence across remount, and the Hint count in the success message
