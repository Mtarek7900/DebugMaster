# 01: Six more Challenges in six new Bug Categories

**What to build:** Content, plus the six new Bug Categories they need. Add six Challenges, 2 easy, 2 medium and 2 hard, so the catalog grows from 6 to 12 and stays balanced across Difficulties. Each uses a Bug Category the catalog doesn't have yet:

| Difficulty | Challenge | Bug Category |
|---|---|---|
| easy | Free shipping still charges $4.99 | falsy default |
| easy | Leaderboard ranks 1,200 points below 950 | default sort order |
| medium | Sold-out items stay in the cart | changing a list while looping |
| medium | Recently viewed shows the same product twice | reference equality |
| hard | One bounced email stops every reminder | missing `await` |
| hard | Every other invite address is rejected | global regex state |

The same rules apply as for the MVP Challenges: realistic code with exactly one bug, a symptom-first Bug Report, 3–5 Hints that teach the method in order, and a Walkthrough that explains the diagnosis and how to recognise the Bug Category next time.

**Status:** done

- [x] Six new Challenge folders, one per new Bug Category, picked up with no code changes beyond adding the categories
- [x] Each has one bug in one file of about 20–80 lines of realistic code
- [x] Each Bug Report describes the symptom and how to reproduce it, never the bug's location
- [x] Each has Hidden Checks that reject a fix that just hard-codes the Visible Checks' expected values
- [x] Early Hints teach the method rather than the fix
- [x] The catalog integrity suite passes, and now asks for an equal number of Challenges at each Difficulty instead of exactly 2
- [ ] Playtested by a person
