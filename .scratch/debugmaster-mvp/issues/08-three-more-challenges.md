# 08: Three more Challenges (type coercion, shared-object mutation, closure in a loop)

**What to build:** Content only. Add three Challenges so the catalog has 2 easy and 2 medium: one type coercion, one shared-object mutation, one closure-in-a-loop. Choose Difficulties so that, together with the off-by-one Challenge from 01, there are exactly 2 easy and 2 medium. Each is realistic application code with exactly one bug, a symptom-first Bug Report, 3–5 Hints that teach the method in order (reproduce → read the evidence → narrow down → form a theory → fix), and a Walkthrough that explains the diagnosis and how to recognise the Bug Category in future.

**Blocked by:** 03 (Submit, Hidden Checks and Solved)

**Status:** ready-for-agent

- [ ] Three new Challenge folders exist, one per listed Bug Category, picked up with no code changes
- [ ] Each has one bug in one file of about 20–80 lines of realistic code
- [ ] Each Bug Report describes the symptom and how to reproduce it, never the bug's location
- [ ] Each has Hidden Checks that reject a fix that just hard-codes the Visible Checks' expected values
- [ ] Early Hints teach the method rather than the fix
- [ ] The catalog integrity suite passes for all Challenges
