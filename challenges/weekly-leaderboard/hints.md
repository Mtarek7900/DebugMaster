## Reproduce

Press **Run**. Last week's leaderboard passes and this week's fails. Compare the two lists of scores in the checks. What does this week have that last week didn't? The Bug Report has a clue too.

## Read the evidence

Look at the actual order for this week: 950, 80, then 1200. It isn't random, and it isn't simply reversed. Write the three scores down as **text** and put them in dictionary order. What do you get?

## Narrow down

Ties and alphabetical order work, so the names are being sorted correctly. The problem is the order of the *scores*. Find the line that puts the distinct scores in order and log what it produces: `console.log([950, 1200, 80].sort())`.

## Form a theory

The names are sorted with a compare function, and the scores aren't. What does `Array.prototype.sort()` compare when you don't give it a compare function?

## Fix

Give the scores' `sort` a compare function that compares them as numbers, highest first, so the separate `reverse()` is no longer needed.
