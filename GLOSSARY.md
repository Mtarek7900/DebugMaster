# DebugMaster

A practice site where developers learn to debug by fixing deliberately broken programs, guided by a step-by-step method rather than handed the answer.

## Language

### Challenges

**Challenge**:
One practice exercise: a piece of Broken Code together with everything needed to diagnose and fix it (expected behaviour, Hints, Walkthrough, and the checks that decide whether it is Solved).
_Avoid_: Puzzle, kata, exercise, problem

**Broken Code**:
The deliberately faulty program at the heart of a Challenge. Each contains exactly one bug.
_Avoid_: Bugged code, buggy code, starter code

**Bug Report**:
The symptom-first description a Learner sees when opening a Challenge: what goes wrong and how to reproduce it, never where the bug is.
_Avoid_: Prompt, task, instructions

**Visible Check**:
A check the Learner can see and run freely; at least one fails at the start, reproducing the Bug Report.
_Avoid_: Public test, sample test

**Hidden Check**:
A check the Learner cannot see that decides whether the Challenge is Solved, guarding against fixes that only satisfy the Visible Checks.
_Avoid_: Private test, secret test, grader

**Difficulty**:
How hard a Challenge is: easy, medium or hard.
_Avoid_: Level, tier

**Bug Category**:
The kind of mistake a Challenge's bug represents, such as off-by-one, async race, mutation, closure scope or type coercion.
_Avoid_: Tag, topic, bug type

**Reference Fix**:
The author's corrected version of the Broken Code, proving the Challenge is solvable and that its checks are sound. Never shown to the Learner.
_Avoid_: Solution, answer key, fixed code

### Guidance

**Hint**:
One step of guidance a Learner chooses to reveal during a Challenge. Each Hint teaches a step of the debugging method rather than giving away the fix.
_Avoid_: Clue, tip

**Walkthrough**:
The full, step-by-step explanation of how to diagnose and fix a Challenge, shown once the attempt is over.
_Avoid_: Solution, answer, explanation

### Learners

**Learner**:
A developer working through Challenges.
_Avoid_: User, student, player

**Solved**:
The state of a Challenge once the Learner's fix passes all its Visible and Hidden Checks without the Walkthrough having been revealed.
_Avoid_: Complete, done, passed

**Revealed**:
The state of a Challenge whose Walkthrough the Learner opened by giving up. A Revealed Challenge stays Revealed even if later fixed.
_Avoid_: Failed, skipped, forfeited
