---
title: Notification settings leak between accounts
difficulty: medium
category: shared-object-mutation
---

Support has a strange batch of tickets about the **Account > Notifications** screen.

A customer who has never touched their settings says SMS alerts are switched **on**, although SMS is off by default. Another customer pressed **Reset to defaults** and promotions stayed switched on. Someone on the support team noticed that the wrong settings always match choices *another* account saved earlier on the same server. After a server restart, everything looks right again for a while.

**To reproduce:** press **Run**. The checks load several accounts one after another in the same session, the way the server does.

`settingsFor(saved)` builds an account's settings: the defaults with the account's saved choices applied on top. `defaultSettings()` returns the defaults, and **Reset to defaults** uses it too. `shouldNotify(settings, channel, topic, hour)` decides whether a notification is sent.
