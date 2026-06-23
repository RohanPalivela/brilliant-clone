# Dynamic Programming — Smoothed Lesson Flow (proposal v2)

This is the **insight-driven** flow for the four-lesson Dynamic Programming course.
The guiding bar: every activity must either *discover* an insight (exploration) or
*enact* it (reinforcement). No slide is "tap cells because the app is interactive."

---

## The problem with naive interactivity (what we're avoiding)

All four activities are "mark each step reachable/unreachable." The trap: a learner
can mentally **brute-force every jump sequence from the ground** and still mark every
cell correctly — completing the activity *without ever using the DP idea*. The whole
point of dynamic programming is the opposite of brute force: **decide each step using
only the handful of already-decided steps one jump below it, and never recompute.**

So the redesign does three things the old draft didn't:

1. **Forces the recurrence.** A slide isolates a single step and makes the learner
   decide it *purely from its predecessors* (`i−3`, `i−5`) — you literally cannot
   answer by simulating paths. That is the moment the insight lands.
2. **Enacts "compute once, reuse."** Instead of re-filling the same map a third time,
   Lesson 2 hands the learner a table that is **already filled up to step 6 and
   locked**, and asks them to finish it using only earlier cells. This makes the
   table feel like stored work you build on — the actual meaning of tabulation.
3. **Names the payoff.** A checkpoint contrasts brute force ("re-trace every path
   from 0") with the table ("read two earlier cells"), so the learner can say *why*
   DP is better, not just *that* it gets the right answer.

---

## The four insights (one per lesson, each builds on the last)

| Lesson | The single insight the learner should walk away with |
|---|---|
| 1 · Can You Reach the Top? | **A step is reachable *iff* some step exactly one jump below it is reachable.** You build the answer up from the ground; you don't re-trace paths. |
| 2 · From Stairs to Arrays | **That reasoning *is* a table you fill once, left to right — each cell reads a couple of earlier cells and is never recomputed.** (tabulation = stored, reused work) |
| 3 · Changing the Rules | **The method never changes; only the look-back set does — and the jump set controls how much is reachable.** (transfer + generalization) |
| 4 · The DP Mindset | **This "build big from smaller, reuse sub-answers" shape is a named pattern that scales to non-obvious cases and collapses into a tiny loop.** |

Jump sets: L1 `3,5/11`, L2 `3,5/11` (deliberate reuse for recognition), L3 `2,3,4/11`,
L4 **`3,7/13`** (sparse → 6 scattered dead-ends, so it genuinely must be reasoned out).

---

## Lesson 1 — Can You Reach the Top?  *(jumps 3 or 5, target 11)*

> Answer key: reachable **0, 3, 5, 6, 8, 9, 10, 11**; dead-ends 1, 2, 4, 7.
> Look-backs of 11: **{6, 8}**.

| # | Type | Component | Purpose — and how it delivers the insight |
|---|---|---|---|
| 1 | prompt | MultipleChoice | **Hook.** "On the ground (step 0). Each move climbs exactly 3 or 5. Land *exactly* on 11?" → Yes. Wrong-feedback: try stacking jumps (3+3+5=11). |
| 2 | explore | StairGrid (editable) | **Discover the dependency.** "Tap any step. Only two lower steps glow — the ones a single 3- or 5-jump below it. Those are the *only* steps that decide it." Ungated; the glow is the discovery. |
| 3 | prompt | MultipleChoice | **The insight beat (forces the recurrence).** "Step 7's only launch pads are step 4 and step 2 (7−3 and 7−5). Both are ✗. So is step 7 reachable?" → No. You can't answer this by simulating — you must reason from predecessors. |
| 4 | checkpoint | StairGrid (editable) | **Reinforce across the whole staircase.** "Now mark every step 0→11." Validates full reachability. Hint/wrong-feedback restate: a step is ✓ only if (i−3) or (i−5) is ✓. |
| 5 | explain | RichText **+ read-only StairGrid** | **Reveal + name.** "You just did dynamic programming — every answer was built from smaller answers you already trusted." Visual: solved staircase, **11 ← {6, 8} highlighted.** |
| 6 | celebrate | RichText | "Bottom-up thinking unlocked. Next: give that staircase a memory." |

---

## Lesson 2 — From Stairs to Arrays  *(jumps 3 or 5, target 11)*

> Same numbers as L1 *on purpose* — the learner should recognize the array as "the
> same staircase lying down," not solve a new puzzle. The new work is the *process*.

| # | Type | Component | Purpose — and how it delivers the insight |
|---|---|---|---|
| 1 | explain | RichText **+ read-only ArrayRow** | **Morph.** "Lay the steps flat. Each cell stores one fact: is this height reachable?" Emphasis `index = height · value = reachable`. Visual: the solved row. |
| 2 | explore | ArrayRow (editable) | **Same logic, new shape.** "Tap cells; selecting cell `i` glows `i−3` and `i−5`, exactly like the stairs." Ungated. |
| 3 | prompt | ArrayRow (editable, **pre-filled & locked 0→6**) | **Enact compute-once / reuse.** Cells 0–6 arrive already solved and locked. "Finish `reachable[7..11]` using only earlier cells — you never re-trace from 0." Validates full map. This is the anti-slop core: the table is *stored work you extend.* |
| 4 | checkpoint | MultipleChoice | **Name the payoff (brute force vs table).** "The slow way re-traces every jump sequence from 0. What does the filled table let you skip?" → "Re-computing answers you already wrote down." |
| 5 | explain | RichText **+ read-only ArrayRow** | **The recurrence in words.** Emphasis `reachable[i] = reachable[i−3] OR reachable[i−5]`. Visual: **11 ← {6, 8} highlighted** on the array. |

---

## Lesson 3 — Changing the Rules  *(jumps 2, 3, or 4, target 11)*

> Canonical brief scenario. Range selector works because `{2,3,4}` is contiguous →
> look-back window **{7, 8, 9}**. The "almost everything is reachable" result is
> turned into a deliberate insight, not filler.

| # | Type | Component | Purpose — and how it delivers the insight |
|---|---|---|---|
| 1 | prompt | MultipleChoice | **Re-hook.** "New rule: jump 2, 3, or 4. Does the same bottom-up trick still reach step 11?" → Yes. |
| 2 | explore | RangeSelector | **Play with the look-back window.** "Drag the handles; watch which prior steps fall inside." Ungated. |
| 3 | checkpoint | RangeSelector | **Reinforce look-back for new jumps.** "Set the window to exactly the steps that decide `F(11)`." Validates `{7, 8, 9}`. Wrong-feedback: 11−4=7, 11−3=8, 11−2=9. |
| 4 | prompt | StairGrid (editable) | **Sweep, and notice density.** "Mark the full map for jumps 2, 3, 4." Validates `{2,3,4}/11` (only step 1 is a dead-end). The near-full map is *the point of the next slide.* |
| 5 | checkpoint | MultipleChoice | **Density insight.** "Almost every step was reachable. Why?" → "Small, closely-spaced jumps leave few gaps — the jump set decides how much you can reach." (Sets up the sparse L4 capstone.) |
| 6 | explain | RichText **+ read-only StairGrid** | **Generalize + caveat.** "For any step `i`, look back at `i−j` for every jump `j`." Note: the look-backs were a *contiguous* window only because the jumps were consecutive — in general they're just specific cells. Visual: **11 ← {7, 8, 9} highlighted.** |

---

## Lesson 4 — The DP Mindset  *(capstone jumps 3 or 7, target 13)*

> Capstone answer key: reachable **0, 3, 6, 7, 9, 10, 12, 13**; dead-ends **1, 2, 4,
> 5, 8, 11**. Look-backs of 13: **{6, 10}**. Sparse, non-contiguous jumps → you
> *cannot* eyeball this; you must sweep bottom-up. That's the proof the method works.

| # | Type | Component | Purpose — and how it delivers the insight |
|---|---|---|---|
| 1 | explain | RichText | **Name it.** Emphasis: "Build solutions to big problems from solutions to smaller subproblems." "The staircase was one instance." |
| 2 | checkpoint | MultipleChoice (multi) | **Recognize the shape.** "Select every DP-shaped problem." ✓ reachability, Fibonacci, fewest-coins; ✗ find-the-max, alphabetize. |
| 3 | prompt | StairGrid (editable) | **Real capstone.** "Jumps of 3 or 7, climb to 13. Mark the full map." Validates `{3,7}/13`. The non-contiguous look-backs (`i−3`, `i−7`) and 6 scattered dead-ends force genuine bottom-up reasoning. |
| 4 | explain | RichText **+ read-only StairGrid** | **Bridge to code.** "The by-hand sweep is a short loop." Pseudocode (reads a `jumps` list) + visual: solved `{3,7}/13`, **13 ← {6, 10} highlighted** so loop and picture align. |
| 5 | celebrate | RichText | "You think in DP now — discovered reachability, stored it, generalized the rule, named the pattern." |

---

## Code changes required

Content edits cover most of it. Three small, **backward-compatible** widget additions
support the new beats (all new props optional; existing behavior unchanged):

1. **`src/types/content.ts`**
   - `StairGridProps` / `ArrayRowProps`: add optional `highlightIndices?: number[]`,
     `showSolution?: boolean`, and `prefillUpTo?: number` (cells `0..prefillUpTo`
     arrive solved + locked).
   - `RichTextProps`: add optional `visual?: { component: 'StairGrid' | 'ArrayRow';
     steps; jumpSizes; highlightIndices? }` so an `explain` slide shows text **and**
     a read-only solved grid (still one concept).

2. **`ReachabilityCells.tsx`**
   - Persistent `highlightIndices` (union with the on-hover/focus glow).
   - `lockedUpTo`: cells at or below it are read-only (like the ground cell).

3. **`StairGrid.tsx` + `answers.ts` + `SlideView.tsx`**
   - `showSolution` renders the computed correct marks read-only.
   - `defaultAnswer` seeds the solved+locked prefix when `prefillUpTo` is set.
   - `SlideView` renders the optional `visual` grid beneath RichText.

No change to validation, persistence, streaks, routing, gating, or the data model.

## Intentionally unchanged
4 lessons; `3,5/11` reuse across L1→L2; the RangeSelector `{7,8,9}` answer; the
component library, feedback tone, and data model.
