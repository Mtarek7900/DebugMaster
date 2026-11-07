---
title: Every shortcut opens the same panel
difficulty: medium
category: closure-in-loop
---

Analysts say the dashboard's keyboard shortcuts are broken.

The dashboard has three panels: **Revenue**, **Traffic** and **Signups**. **Alt+1** should open Revenue and **Alt+2** should open Traffic, but every shortcut opens **Signups**. **Alt+3** "works", but only because Signups is the panel it should open anyway. The cheat sheet you get by pressing **?** lists the right shortcut next to each panel, so the shortcuts seem to be set up correctly.

**To reproduce:** press **Run**. The checks build the three-panel dashboard and press each shortcut.

`createDashboard(panels)` takes a list of `{ id, title }` and returns a dashboard with `press(key)` (`true` when the key is a shortcut), `openPanel()` (the id of the open panel) and `history()` (the ids of the panels opened, in order). `describeShortcuts(panels)` builds the cheat sheet.
