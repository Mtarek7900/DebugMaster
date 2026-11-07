# 06: Autosave code and Reset

**What to build:** The Learner's work is never lost by accident. Their code for each Challenge is saved as they type and restored when they return or reload. A Reset button, after confirmation, restores the original Broken Code. Reset rewrites only the code, never the Learner's history (status and Hint count are unchanged).

**Blocked by:** 03 (Submit, Hidden Checks and Solved)

**Status:** ready-for-agent

- [x] Editor changes are saved per Challenge in the Progress Store as the Learner types (debounced is fine)
- [x] Reopening or reloading a Challenge restores the saved code instead of the Broken Code
- [x] A Reset button asks for confirmation; confirming restores the Broken Code and clears the saved code
- [x] Reset leaves the status (Solved/Revealed) and Hint count unchanged
- [x] With storage unavailable, editing still works for the session
- [x] Page-level tests cover restore across remount, Reset cancel/confirm, and status preserved through Reset
