# 05: Give Up and Revealed

**What to build:** A Learner who is truly stuck can press Give Up. After confirming, the Walkthrough opens and the Challenge is marked Revealed permanently. They can keep editing, running and submitting to practise applying the fix, but a Revealed Challenge never becomes Solved, so Solved always means solved without the Walkthrough.

**Blocked by:** 03 (Submit, Hidden Checks and Solved)

**Status:** ready-for-agent

- [x] The Challenge page has a Give Up button that asks for confirmation; cancelling changes nothing
- [x] Confirming opens the Walkthrough and sets the status to Revealed in the Progress Store
- [x] After Give Up, Run and Submit still work; a fully passing Submit shows that the checks pass but the status stays Revealed
- [x] Revealed persists across a reload
- [x] Give Up is not offered once a Challenge is Solved (the Walkthrough is already open)
- [x] Page-level tests cover cancel, confirm → Revealed + Walkthrough, Submit-after-Revealed staying Revealed, and persistence
