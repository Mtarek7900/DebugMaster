# 10: Page layout for desktop and phone

**What to build:** The Challenge page and list page look intentional. On desktop, the Bug Report, editor, results/console and Hints sit side by side so the Learner sees everything while working. On a phone, the Challenge page stacks Bug Report → editor → results (with Hints and the Walkthrough below) and stays usable with no horizontal page scroll. Desktop-first; mobile only needs to be usable.

**Blocked by:** 05 (Give Up and Revealed), 06 (Autosave code and Reset), 07 (Challenge list page)

**Status:** ready-for-agent

- [ ] Desktop (≥ 1024px wide): a multi-panel Challenge page layout with the editor prominent and results/console visible without scrolling past the editor
- [ ] Phone (~375px wide): a stacked order of Bug Report → editor → results → Hints → Walkthrough; no horizontal page scroll
- [ ] The list page is readable at both widths, with filters usable on a phone
- [ ] Existing page-level tests still pass
