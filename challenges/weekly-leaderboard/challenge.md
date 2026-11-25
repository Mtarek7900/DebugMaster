---
title: Leaderboard ranks 1,200 points below 950
difficulty: easy
category: default-sort
---

The weekly leaderboard in the typing-speed game has started ranking players in a strange order.

This week **Priya** scored **1,200** points, the best in the game, but she is shown in **last** place, below **Tom** with **950** and **Ana** with **80**. Last week's leaderboard looked right, and nobody scored over 999 then. Players with the same score are supposed to share a rank and be listed alphabetically. That part still seems to work.

**To reproduce:** press **Run**. The checks rank last week's players and this week's players.

`rankPlayers(entries)` takes `{ name, score }` entries and returns the leaderboard rows `{ rank, name, score }`, highest score first. Players with the same score share a rank, and the next rank skips accordingly (1, 1, 3). `formatRow(row)` gives the text shown for one row.
