# Skeptical Critique of the 58 Candidate Review Problems

Reviewer stance: assume the generator was over-eager. A candidate only ships if it is
(a) numerically correct against `dp.ts`/`validation.ts`, (b) inside the taught lesson
patterns *and* difficulty, (c) not a redundant retread of the existing bank or of another
candidate, and (d) clean prose. "Gradable" is necessary but **not sufficient** — the grader
will happily accept a problem the lessons never prepared the learner for.

## TL;DR

- **Ship now: 38.** Ship after edits: 11. **Cut: 9.**
- All 58 are numerically correct and gradable (`npx vitest run --config scratch/vitest.config.ts` → **64/64 pass**; `discover.mjs` re-derives every reachable set, multiset, optimum, and first-coin uniqueness). I found **no prose/answer mismatch** in any candidate.
- The cuts are not correctness failures — they are **lesson-fit / drift / redundancy** failures, exactly the things a grader can't catch:
  - **Frobenius / "coprime" reachability drift** (`cand-reach-6-10-15`, `cand-reach-7-11`).
  - **No-1-coin "stranding" fewest/first-choice** that L5/L6 never teach (`cand-coin-3-5-t11-fewest`, `cand-min-2-7-a8`, `cand-min-3-7-a9`).
  - **Duplicate recurrence-code** that re-treads a lesson slide or an existing bank item (`cand-code-coin-feasible`, `cand-code-reach-or`, `cand-code-countways-coins`), and one **exact-duplicate look-back answer set** (`cand-look-3-6-12-at-12`).
- Ramp verdict: reachability, paths, and look-back get a genuine easy→hard ramp **only because the candidates add the missing easy rungs** the existing bank lacks. **Optimal-first-choice has no ramp at all** (7 of 8 are difficulty 3). The hard tiers of reachability/paths are inflated by *tedium and number theory*, not by new DP ideas.

---

## Ground truth used for grading

Taught scope, lesson by lesson (this is the bar every candidate is measured against):

| Lesson | Pattern actually practiced (checkpoint) | Jumps / coins used | Notes that bound difficulty |
|---|---|---|---|
| L1 staircase | reachability sweep + 1 PathBuilder | `{3,5}`, steps ≤ 11 | small, dense; introduces "strand with no legal jump" for *paths* |
| L2 stairs→array | reachability `reachable[]`, predecessor-pick | `{3,5}`, steps 11 | look-back = subtract a jump |
| L3 new jumps | reachability + predecessor-pick | `{2,3,4}`, steps ≤ 9 | explicitly teaches "dense small jumps ⇒ few gaps; sparse `{3,7}` ⇒ many gaps" — **conceptual only, not a sweep to solve** |
| L4 DP mindset | reachability **code-blanks** (OR) | `{3,5}` | counting-ways / SUM is **explained, never practiced in a checkpoint** |
| L5 coin change | coin feasibility (CoinBuilder, ArrayRow, code-blanks) | `{4,5}` t13 | no-1-coin **feasibility** is taught here |
| L6 fewest coins | fewest CoinBuilder, **MinChoicePicker**, fewest code-blanks | `{1,3,4}` t6 | greedy fails by **overshoot, with a 1-coin present**; **stranding/no-1-coin is NOT taught for fewest or first-choice** |

Two facts that matter for the verdicts:
1. The learner solves every reachability/look-back board by **mechanically applying the OR look-back rule** — they never compute a Frobenius number, gcd, or parity argument. So a board's *gap structure* is **not** a legitimate difficulty axis for this curriculum; "coprime"/"Frobenius" framing is teaching vocabulary the course never introduces.
2. `ReviewItem` (`src/types/review.ts`) has **no difficulty field**. The "1–5" ratings are pure authorial documentation; the only thing that creates a ramp is *which problems exist and how they're curated*. So clustering is a real, uncorrectable defect.

### Verification re-run (independent)

- `64 passed (64)` via the scratch vitest config.
- `discover.mjs` reproduces every claimed number. Spot confirmations: `{7,11}` top step 26 unreachable ✓; `{5,8}` last gap 19 ✓; all 10 path targets `exactMultisets === 1` ✓; every fewest trap's optimum and first-coin uniqueness ✓.
- **Harness defect found:** `discover.mjs` line ~199 still lists the *rejected* min-choice `M8 = {1,5,9} t25` (`optimalFirstCoins=[1,5,9]`, **not unique**), but the shipped candidate is `cand-min-1-8-9-a24` (`{1,8,9}`, unique). The end-to-end test does cover the shipped one, but the "discovery" harness the doc points to **does not match the file it claims to verify** for that item. Undercuts the "every number re-derived" claim; fix or delete the stale row.

---

## 1) Reachability sweeps — 8 ship, 0 edits, **2 cut**

| id | jumps/steps | gen diff | my diff | verdict | reason |
|---|---|---|---|---|---|
| `cand-reach-1-2-stairs` | {1,2}/7 | 1 | 1 | **ACCEPT** | base-case warm-up; **fills the easy rung the existing bank lacks** (bank starts at steps 15). |
| `cand-reach-2-3-array` | {2,3}/9 | 2 | 2 | **ACCEPT** | single gap at 1; clean. |
| `cand-reach-3-4-stairs` | {3,4}/13 | 2 | 2 | **ACCEPT** | one mid gap (5); good. |
| `cand-reach-3-5-array` | {3,5}/14 | 3 | 3 | **ACCEPT** | on-theme (lessons' own `{3,5}`); honest mid-gap-7 trap. |
| `cand-reach-2-7-stairs` | {2,7}/16 | 3 | 3 | **ACCEPT** | parity told as "odd steps need the 7" — no number-theory jargon. Good. |
| `cand-reach-5-8-array` | {5,8}/20 | 4 | 4 | **ACCEPT** | deep-gap board; slide prose stays jargon-free ("gaps run deep"). Near-twin of `4-9` below (both headline "last gap 19") — keep both but don't add a third. |
| `cand-reach-4-9-stairs` | {4,9}/22 | 4 | 4 | **ACCEPT** | fine; mid-board strands 14/15. See twin note above. |
| `cand-reach-2-3-7-array` | {2,3,7}/12 | 2 | 2 | **ACCEPT** | nice "more jumps ≠ more gaps" contrast. |
| `cand-reach-6-10-15-array` | {6,10,15}/24 | 5 | 3* | **REJECT** | (a) **near-duplicate** of shipped `rb-reach-6-9-15-stairs` (common-factor set + one odd breaker — same lesson). (b) Its whole pitch is **parity/modular reasoning** ("odd cells only appear after a 15"), the exact drift flagged. (c) diff-5 is **tedium-inflated** — the OR sweep is identical to a diff-2 board. |
| `cand-reach-7-11-stairs` | {7,11}/26 | 5 | 4* | **REJECT** | **Worst Frobenius drift.** Hint literally says *"large and coprime, so reachable steps are RARE"* — "coprime" is vocabulary the course never teaches, used as a solving crutch. The "staircase whose top step can't be finished" also contradicts L1's framing. Bank already has hard sparse boards (`4-7`, `5-7` to steps 22) without jargon; this just pushes tedium. (Salvageable only if reframed as an `array`, the gcd/coprime language stripped, and re-rated — but not worth it given existing coverage.) |

\*Re-rate reflects that the *concept* is constant; the generator rated by gap density, which the learner never reasons about.

**Ramp after cuts:** 1 → 2 (×3) → 3 (×2) → 4 (×2). Smooth, and the diff-1/2 additions are the real win. The hard tier (`5-8`, `4-9`) is plenty; rejecting the two number-theory boards *improves* calibration.

---

## 2) Building paths — 8 ship, **2 edits**, 0 cut

Every diff-3+ path is the **same single idea** ("greedy overshoots and strands; mix in the smaller jump"), which the existing bank already drills across 8 problems. The candidates' genuine contribution is the **easy rungs where greedy succeeds** (missing from the bank).

| id | jumps→target | gen diff | my diff | verdict | reason |
|---|---|---|---|---|---|
| `cand-path-2-5-to-9` | {2,5}→9 | 1 | 1 | **ACCEPT** | greedy works; warm-up the bank lacks. |
| `cand-path-2-7-to-11` | {2,7}→11 | 2 | 2 | **ACCEPT** | greedy works + parity. |
| `cand-path-3-4-to-10` | {3,4}→10 | 3 | 3 | **ACCEPT** | clean overshoot strand. |
| `cand-path-3-5-to-14` | {3,5}→14 | 3 | 3 | **ACCEPT** | on-theme set; distinct target from bank's `3-5-to-22`. |
| `cand-path-2-5-to-13` | {2,5}→13 | 3 | 3 | **ACCEPT** | "one odd 5 forced"; distinct from `2-5-to-9`. |
| `cand-path-5-8-to-26` | {5,8}→26 | 5 | 4 | **ACCEPT** | "two of each" — slightly richer reasoning; new set. |
| `cand-path-4-7-to-22` | {4,7}→22 | 4 | 4 | **ACCEPT** | new set; clean. |
| `cand-path-3-8-to-25` | {3,8}→25 | 5 | 4 | **ACCEPT** | long tail of 3s; new set. |
| `cand-path-4-5-to-22` | {4,5}→22 | 4 | 4 | **ACCEPT-WITH-EDITS** | **third `{4,5}` strand** (bank has `4-5-to-13`, `4-5-to-21`). Keep only if you want a longer 3×4+2×5 multiset; otherwise cut for variety. |
| `cand-path-6-7-to-24` | {6,7}→24 | 4 | 4 | **ACCEPT-WITH-EDITS** | "big jump never used" is **the exact concept of shipped `rb-path-6-7-to-18`**, same set. Differentiate or cut. |

**Ramp:** good 1→4. No diff-5 by concept (correctly — the concept tops out). Trim the two flagged near-dupes to avoid an 18-problem mono-concept pile across bank+candidates.

---

## 3) Look-back dependencies — 5 ship, **2 edits**, **1 cut**

The two "edge cases" (jump == target ⇒ cell 0 is a predecessor; oversized jump filtered out) are **already taught by the bank** (`rb-look-4-7-13-at-13`, `rb-look-3-8-17-at-12`). The candidates repeat each one — and repeat jump==target *twice internally*.

| id | jumps@target → preds | gen diff | my diff | verdict | reason |
|---|---|---|---|---|---|
| `cand-look-1-2-3-at-8` | {1,2,3}@8 → {5,6,7} | 1 | 1 | **ACCEPT** | consecutive/clustered easy rung; bank has none this easy. |
| `cand-look-2-4-6-at-10` | {2,4,6}@10 → {4,6,8} | 2 | 2 | **ACCEPT** | all-even preds; reject-odd-decoy. |
| `cand-look-3-5-8-at-14` | {3,5,8}@14 → {6,9,11} | 3 | 3 | **ACCEPT** | spread preds; clean. |
| `cand-look-4-6-11-at-15` | {4,6,11}@15 → {4,9,11} | 3 | 3 | **ACCEPT** | long 11-jump reaches near start; distinct. |
| `cand-look-2-7-9-at-13` | {2,7,9}@13 → {4,6,11} | 3 | 3 | **ACCEPT** | same target 13 + similar spread to `rb-look-2-6-9-at-13`, but different jumps → acceptable interleave. |
| `cand-look-5-9-14-at-14` | {5,9,14}@14 → {0,5,9} | 4 | 3 | **ACCEPT-WITH-EDITS** | jump==target edge — **already covered** by `rb-look-4-7-13-at-13`. Keep this as the *one* jump==target candidate (it has the cleaner story) and cut the next. |
| `cand-look-3-6-12-at-12` | {3,6,12}@12 → {0,6,9} | 4 | 3 | **REJECT** | **Exact same predecessor answer set `{0,6,9}` as the shipped `rb-look-4-7-13-at-13`**, *and* duplicates `cand-look-5-9-14` (jump==target). Doubly redundant. |
| `cand-look-4-7-15-at-11` | {4,7,15}@11 → {4,7} | 4 | 3 | **ACCEPT-WITH-EDITS** | oversized-filtered edge — **already covered** by `rb-look-3-8-17-at-12`. Only 2 preds ⇒ actually *easier* than diff-4; re-rate to 3 and keep as the lone "filter" variant or cut. |

**Ramp:** 1 → 2 → 3 (cluster). After cuts it's still bottom-heavy with no diff-5, but look-back genuinely has no "hard" beyond more-spread predecessors, so that's fine. The fix is **de-clustering at diff 3-4**, not adding hard ones.

---

## 4) Coin change — 7 ship, **2 edits**, **1 cut**

| id | coins/target | mode | gen diff | my diff | verdict | reason |
|---|---|---|---|---|---|---|
| `cand-coin-3-7-t27` | {3,7} t27 | plain | 3 | 3 | **ACCEPT** | no-1-coin **feasibility** is squarely L5; 2 valid multisets, prose says so. |
| `cand-coin-4-9-t30` | {4,9} t30 | plain | 3 | 3 | **ACCEPT** | unique combo; clean. |
| `cand-coin-5-8-t39` | {5,8} t39 | plain | 4 | 4 | **ACCEPT** | high search tedium (t39) but in-scope; fine as a hard feasibility rung. |
| `cand-coin-6-10-t38` | {6,10} t38 | plain | 4 | 4 | **ACCEPT** | mild concept overlap with bank's `6-9-t24` (common-factor) but distinct numbers. |
| `cand-coin-1-4-5-t8-fewest` | {1,4,5} t8 | fewest | 2 | 2 | **ACCEPT** | overshoot trap **with a 1-coin** = exactly L6's shape. |
| `cand-coin-1-9-10-t27-fewest` | {1,9,10} t27 | fewest | 3 | 3 | **ACCEPT** | extreme-gap overshoot, 1-coin present; clean (9-coin greedy is the point). |
| `cand-coin-1-7-8-t21-fewest` | {1,7,8} t21 | fewest | 3 | 3 | **ACCEPT** | new coin set; in-scope. |
| `cand-coin-1-6-7-t24-fewest` | {1,6,7} t24 | fewest | 3 | 3 | **ACCEPT-WITH-EDITS** | **same coin set as shipped `rb-coin-arcade-1-6-7-12`** (6-vs-7 trap). Different target only; keep one. |
| `cand-coin-1-5-8-t10-fewest` | {1,5,8} t10 | fewest | 2 | 2 | **ACCEPT-WITH-EDITS** | **same coin set as shipped `rb-coin-bridge-1-5-8-15`**. Keep one. |
| `cand-coin-3-5-t11-fewest` | {3,5} t11 | fewest | 4 | — | **REJECT** | **No-1-coin stranding fewest** — the flagged drift. L6 teaches fewest *with* a 1-coin and *overshoot*, never stranding. Duplicates the concept of shipped `rb-coin-parking-4-5-12`. The generator itself admits the optimal first coin **isn't unique** here, so it doesn't even reinforce the first-choice idea — it's a feasibility-dead-end wearing a `fewest` flag. Gradable (grader only checks min count), but out of taught scope. |

**Ramp:** plain 3–4, fewest 2–3. No diff-1, no diff-5; serviceable. The cut removes the one item that worsens the no-1-coin drift.

---

## 5) Optimal first choice — 5 ship, **1 edit**, **2 cut**

Biggest calibration problem in the whole drop: **7 of 8 are difficulty 3** (the 8th is 2). No ramp, and heavy numeric overlap with the coin-fewest set ({1,4,5}/8, {1,6,7}/24, {1,7,8}/21, {1,9,10}/27 appear in *both* skills).

| id | coins/amount | gen diff | my diff | verdict | reason |
|---|---|---|---|---|---|
| `cand-min-1-4-5-a8` | {1,4,5} a8 | 2 | 2 | **ACCEPT** | clean unique trap, 1-coin present; the only non-3 rating, so keep it as the easy anchor. |
| `cand-min-1-7-8-a21` | {1,7,8} a21 | 3 | 3 | **ACCEPT** | new set; clean. |
| `cand-min-1-9-10-a27` | {1,9,10} a27 | 3 | 3 | **ACCEPT** | extreme gap; clean. |
| `cand-min-1-6-8-a18` | {1,6,8} a18 | 3 | 3 | **ACCEPT** | new set; clean. |
| `cand-min-1-8-9-a24` | {1,8,9} a24 | 3 | 3 | **ACCEPT** | new set; clean. (This is the item `discover.mjs` fails to cover — see harness defect.) |
| `cand-min-1-6-7-a24` | {1,6,7} a24 | 3 | 3 | **ACCEPT-WITH-EDITS** | **same coin set as shipped `rb-min-1-6-7-12`**. Keep one. |
| `cand-min-2-7-a8` | {2,7} a8 | 3 | — | **REJECT** | **No-1-coin stranding** ("only valid start") — duplicates shipped `rb-min-2-5-6` and repeats the flagged drift. L6's MinChoicePicker is `{1,3,4}` overshoot, not stranding. |
| `cand-min-3-7-a9` | {3,7} a9 | 3 | — | **REJECT** | Same stranding drift as `cand-min-2-7-a8` **and** internally redundant with it. Two copies of an untaught idea. |

**Ramp:** essentially flat at diff 3. **Recommendation:** this skill needs an authored *easy* rung (e.g. a 1-coin amount where the answer is obvious) and a genuinely *harder* one (a unique trap where two coins tie for second-best) — neither exists here. Cutting the two stranding traps doesn't hurt the ramp because they were diff-3 too.

---

## 6) Recurrence in code (CodeBlanks) — 1 ship, **2 edits**, **3 cut**

This group is the most over-eager: 6 code-blanks, but the lessons already practice the reachability loop (L4 `m4-s4`), the coin-feasibility loop (L5 `m5-s5`), and the fewest loop (L6 `m6-s8`), and the bank already ships `rb-code-canmake`, `rb-code-countways`, `rb-code-mincoins`. Most candidates re-tread those.

| id | teaches | gen diff | verdict | reason |
|---|---|---|---|---|
| `cand-code-mincoins-init` | INF init + the `+1` | 3 | **ACCEPT** | Tests a **distinct** insight (why the table must seed to INF for `min` to work) that the bank's `rb-code-mincoins` doesn't isolate. Genuinely new. |
| `cand-code-stair-reach` | reachability OR | 2 | **ACCEPT-WITH-EDITS** | Near-identical to **lesson 4's own checkpoint `m4-s4`** (`i-s` vs `i-j` aside). Fine as a deliberate spaced echo of a lesson, but flag it as such; don't pretend it's novel. |
| `cand-code-min-steps` | fewest *steps* (1+min on stairs) | 3 | **ACCEPT-WITH-EDITS** | Same `1+min` recurrence as bank's `rb-code-mincoins`, re-skinned to stairs. Acceptable as a *transfer* item, but it's redundant if shelf space is tight. |
| `cand-code-countways-coins` | counting ways (SUM) on coins | 3 | **REJECT** | **Duplicates bank `rb-code-countways`** (same SUM concept) **and doubles down on the "counting-ways code is explained but never practiced in a lesson" drift** the brief warns about. One countways code-blank is already a stretch; two is over-eager. |
| `cand-code-reach-or` | reachability as explicit `or` | 2 | **REJECT** | **Second reachability code-blank** in the same drop (with `cand-code-stair-reach`) and a third copy of a loop L4/L5 already practice. Redundant. |
| `cand-code-coin-feasible` | coin feasibility seed + look-back | 1 | **REJECT** | **Direct duplicate of shipped `rb-code-canmake`** (same code, same `base=0`/`lookback=a-c` answer) and of L5 `m5-s5`. Nothing new. |

All 6 obey the **one-token-id-per-blank** rule (verified: the test asserts `new Set(ids).size === ids.length` and passes; distractor tokens like `i+s`, `a+c`, `max`, `and` are present and graded wrong). No mechanical issues — the cuts are purely redundancy/drift.

---

## 7) Spotting the pattern (MCQ) — 4 ship, **2 edits**, 0 cut

All six have exactly one correct option, plausible distractors, and **no second-correct ambiguity** (I checked each). `cand-mcq-greedy-146` re-verified: for `{1,4,6}`, `best[8]=2` (4+4) vs greedy 6+1+1=3; option "12" ("greedy 6+6 is optimal") is a *true* statement that is correctly **not** the answer to "where does greedy use more than necessary," so it's a fair distractor, not a second correct answer.

| id | focus | gen diff | my diff | verdict | reason |
|---|---|---|---|---|---|
| `cand-mcq-base-zero` | `best[0]=0` base case | 2 | 2 | **ACCEPT** | fresh angle; L6-grounded. |
| `cand-mcq-reach-or` | reachability combine = OR | 2 | 2 | **ACCEPT** | distinct focus (combine op) vs bank's predecessor MCQ. |
| `cand-mcq-count-sum` | counting combine = SUM | 3 | 3 | **ACCEPT** | reasoning-level SUM is fair (L4 teaches it conceptually even though it's never a coded checkpoint). |
| `cand-mcq-plus-one-role` | role of the `+1` | 4 | 3 | **ACCEPT** | strong conceptual check; re-rate to 3. |
| `cand-mcq-lookback-direction` | which cells cell 10 reads | 2 | 2 | **ACCEPT-WITH-EDITS** | overlaps bank `rb-mcq-predecessors` and the L1/L2/L3 "which earlier steps" MCQs. Fine as extra practice; just know it's not new ground. |
| `cand-mcq-greedy-146` | greedy fails `{1,4,6}`@8 | 3 | 3 | **ACCEPT-WITH-EDITS** | same template as bank `rb-mcq-greedy` (`{1,5,7}`@10), different numbers. Correct & unambiguous; acceptable as an interleave variant. |

---

## Cross-cutting findings

1. **Numerically flawless, pedagogically over-eager.** Zero wrong answers, but ~9 problems should never have been proposed for *this* course because they teach past the lessons or repeat the bank. The grader can't see any of this — which is exactly why a human gate matters.
2. **Drifts the brief warned about are present and, in places, worsened:**
   - Frobenius/coprime reachability: `cand-reach-7-11` puts "coprime" *in the hint*; `cand-reach-6-10-15` is built on parity/modular reasoning.
   - No-1-coin stranding for *fewest/first-choice*: `cand-coin-3-5-t11-fewest`, `cand-min-2-7-a8`, `cand-min-3-7-a9` (3 items) — none supported by L5/L6, which only teach overshoot-with-a-1-coin.
   - Counting-ways-in-code never practiced in a lesson: `cand-code-countways-coins` adds a *second* such item on top of the bank's existing `rb-code-countways`.
3. **Difficulty ratings track tedium/number-theory, not DP concept.** Reachability and path "diff 5"s are the same recurrence as their "diff 2"s with bigger boards/longer multisets. Re-rate the reachability hard tier down by ~1 and stop selling gap-density as difficulty.
4. **Redundancy is the dominant problem, not correctness.** Same coin sets ({1,6,7}, {1,5,8}) duplicated across candidate↔bank; jump==target and oversized-filter look-back edges duplicated candidate↔bank *and* candidate↔candidate; reachability/coin code-blanks duplicating lesson slides.
5. **Harness hygiene:** `discover.mjs` is stale for the min-choice set (still shows the rejected `{1,5,9} t25`), so the "discovery" artifact doesn't actually cover `cand-min-1-8-9-a24`. Fix before citing it as proof.

## Per-skill ramp scorecard (accepted set only)

| Skill | Easy rung? | Smooth middle? | Hard rung that's *conceptually* hard? | Verdict |
|---|---|---|---|---|
| Reachability | ✅ (1-2,2-3,3-4 added) | ✅ | ⚠️ hard tier was tedium/number-theory; trimmed to honest deep-gap boards | **Sound after cuts** |
| Building paths | ✅ (greedy-succeeds added) | ✅ | ❌ concept tops out — that's inherent, fine | **Sound; trim dupes** |
| Look-back | ✅ (consecutive added) | ⚠️ clusters at 3 | ❌ no true hard (inherent) | **OK; de-cluster** |
| Coin change | ⚠️ no diff-1 | ✅ | ✅ feasibility t39 | **Sound after cut** |
| Optimal first choice | ⚠️ one diff-2 only | ❌ flat at diff 3 | ❌ none | **Weak ramp — needs authored easy+hard** |
| Recurrence-code | ✅ | n/a (few items) | n/a | **Over-redundant; keep the novel one** |
| Pattern MCQ | ✅ | ✅ | ✅ (`plus-one-role`) | **Sound** |

## Final ledger

| Skill | ACCEPT | ACCEPT-WITH-EDITS | REJECT |
|---|---|---|---|
| Reachability | 8 | 0 | 2 (`6-10-15`, `7-11`) |
| Building paths | 8 | 2 (`4-5-to-22`, `6-7-to-24`) | 0 |
| Look-back | 5 | 2 (`5-9-14`, `4-7-15`) | 1 (`3-6-12`) |
| Coin change | 7 | 2 (`1-6-7-t24`, `1-5-8-t10`) | 1 (`3-5-t11`) |
| Optimal first choice | 5 | 1 (`1-6-7-a24`) | 2 (`2-7`, `3-7`) |
| Recurrence-code | 1 | 2 (`stair-reach`, `min-steps`) | 3 (`countways-coins`, `reach-or`, `coin-feasible`) |
| Pattern MCQ | 4 | 2 (`lookback-direction`, `greedy-146`) | 0 |
| **Total** | **38** | **11** | **9** |

**Bottom line:** ship the **38** as-is. The **11 edit-ones** are mostly redundancy you can keep *or* cut for variety (if you must dedupe aggressively, the realistic ship count is ~40–44, dropping the same-coin-set and same-edge-case repeats). **Cut the 9** outright — they either teach outside L1–L6 (Frobenius/coprime, no-1-coin stranding, never-practiced counting-code) or duplicate an existing lesson slide / bank answer set. After that, every skill except **optimal-first-choice** has a defensible easy→hard ramp inside the taught material; optimal-first-choice still needs an authored easy rung and a genuinely harder (non-stranding) trap.
