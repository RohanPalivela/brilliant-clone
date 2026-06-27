# Candidate Review Problems — DP Course

Author drop for the Pattern Review Engine. Every problem is **drop-in compatible**
with `src/content/reviewBuilders.ts` and stays **strictly inside the lessons**
(1D staircase reachability, path-building, look-back dependencies,
recurrence-in-code, coin feasibility/count/fewest, optimal first choice).
**No knapsack / 2D DP.**

## How these were verified (not hand-asserted)

All numbers were re-derived from the **same engine the app grades with**
(`src/lib/dp.ts` + `src/lib/validation.ts`):

1. `scratch/discover.mjs` — mirrors `computeReachable`, `minCoinsTable`,
   `optimalFirstCoins`, `lookbackIndices`; prints reachable sets, exact-path
   multiset counts, min-coin optima, greedy-largest counts, and first-coin
   uniqueness for every candidate.
2. `scratch/candidate-problems.ts` — the typed arrays; **`tsc` passes** against
   the real interfaces (`scratch/tsconfig.check.json`).
3. `scratch/candidate-problems.test.ts` — feeds each param through the **real
   builders** and asserts the **real `validateAnswer`** accepts the
   engine-derived correct answer. **64 tests pass** (58 candidates here).

Difficulty scale: **1 trivial → 5 hard**. ids prefixed `cand-` to avoid any
collision with the shipped `rb-` bank.

### Counts

| Skill | Validation type | Count |
|---|---|---|
| Reachability sweeps | `reachability` | 10 |
| Building paths | `jumpPath` | 10 |
| Look-back dependencies | `range` | 8 |
| Coin change | `coinSum` (4 plain + 6 fewest) | 10 |
| Optimal first choice | `minCoinChoice` | 8 |
| Recurrence in code | `codeBlanks` | 6 |
| Spotting the pattern | `multipleChoice` | 6 |
| **Total** | | **58** |

---

## 1) Reachability sweeps (`ReachabilityParams` → `reachability-sweep`)

Reinforces: `reachable[0]=true; reachable[i] = OR over jumps j of reachable[i−j]`.
The `target` shown to the grader is always `steps`, so the learner marks the
whole board 0..steps. Verified reachable sets below come straight from
`computeReachable`.

| id | jumps | steps | variant | diff | reachable cells | gaps | difficulty drivers |
|---|---|---|---|---|---|---|---|
| `cand-reach-1-2-stairs` | {1,2} | 7 | stairs | 1 | 0–7 (all) | none | jump set contains 1 ⇒ nothing strands; pure base-case warm-up |
| `cand-reach-2-3-array` | {2,3} | 9 | array | 2 | 0,2–9 | 1 | single early gap; consecutive jumps fill everything ≥2 |
| `cand-reach-3-4-stairs` | {3,4} | 13 | stairs | 2 | 0,3,4,6–13 | 1,2,5 | one mid gap (5) that looks reachable |
| `cand-reach-3-5-array` | {3,5} | 14 | array | 3 | 0,3,5,6,8–14 | 1,2,4,7 | gap 7 sits *between* reachable cells |
| `cand-reach-2-7-stairs` | {2,7} | 16 | stairs | 3 | 0,2,4,6–16 | 1,3,5 | parity: odd cells locked until the single 7 lands |
| `cand-reach-5-8-array` | {5,8} | 20 | array | 4 | 0,5,8,10,13,15,16,18,20 | 1–4,6,7,9,11,12,14,17,19 | Frobenius(5,8)=27; deep gaps incl. 19 (last) |
| `cand-reach-4-9-stairs` | {4,9} | 22 | stairs | 4 | 0,4,8,9,12,13,16,17,18,20,21,22 | 1,2,3,5,6,7,10,11,14,15,19 | 9 flips parity; stranded mid cells 14,15; last gap 19 |
| `cand-reach-6-10-15-array` | {6,10,15} | 24 | array | 5 | 0,6,10,12,15,16,18,20,21,22,24 | 1–5,7–9,11,13,14,17,19,23 | gcd(6,10)=2 but odd 15 breaks parity; near-top gap 23 |
| `cand-reach-2-3-7-array` | {2,3,7} | 12 | array | 2 | 0,2–12 | 1 | contrast: 3 jumps but only gap 1 (more jumps ≠ more gaps) |
| `cand-reach-7-11-stairs` | {7,11} | 26 | stairs | 5 | 0,7,11,14,18,21,22,25 | everything else | Frobenius(7,11)=59≫26; **top step 26 itself unreachable** |

Spot-checks:
- `{5,8}` 19: 19−5=14 (gap), 19−8=11 (gap) ⇒ unreachable (last gap). ✓
- `{7,11}` 26: 26−7=19 (gap), 26−11=15 (gap) ⇒ staircase top can't be finished. ✓
- `{6,10,15}` 23: 23−6=17, 23−10=13, 23−15=8 all gaps ⇒ unreachable. ✓

---

## 2) Building paths (`PathParams` → `path-building`)

Reinforces: stack jumps that land *exactly* on the target. Each target is an
**engine-confirmed unique multiset** (`exactMultisets === 1`). Most are greedy
traps (taking the largest jump first strands you on an overshoot).

| id | jumps | target | diff | unique exact combo | greedy-largest | concept driver |
|---|---|---|---|---|---|---|
| `cand-path-2-5-to-9` | {2,5} | 9 | 1 | 2+2+5 | 5+2+2 ✓ works | warm-up; greedy succeeds |
| `cand-path-3-4-to-10` | {3,4} | 10 | 3 | 3+3+4 | 4+4=8 **strands** | lean on smaller jump |
| `cand-path-2-7-to-11` | {2,7} | 11 | 2 | 2+2+7 | 7+2+2 ✓ works | parity: exactly one odd 7 |
| `cand-path-4-5-to-22` | {4,5} | 22 | 4 | 4+4+4+5+5 | 5×4=20 **strands** | balance two jump types, longer |
| `cand-path-3-5-to-14` | {3,5} | 14 | 3 | 3+3+3+5 | 5+5+3=13 **strands** | one odd 5 + tail of 3s |
| `cand-path-6-7-to-24` | {6,7} | 24 | 4 | 6+6+6+6 | 7+7+7=21 **strands** | big jump is *never* used |
| `cand-path-5-8-to-26` | {5,8} | 26 | 5 | 5+5+8+8 | 8+8+8=24 **strands** | needs a balanced pair of each |
| `cand-path-4-7-to-22` | {4,7} | 22 | 4 | 4+4+7+7 | 7+7+7=21 **strands** | two of each, backward reasoning |
| `cand-path-3-8-to-25` | {3,8} | 25 | 5 | 3+3+3+8+8 | 8+8+8=24 **strands** | long tail of small jumps |
| `cand-path-2-5-to-13` | {2,5} | 13 | 3 | 2+2+2+2+5 | 5+5+2=12 **strands** | one odd 5 forced by odd target |

(“strands” = greedy reaches a sub-target from which every remaining jump
overshoots, with no exact finish — verified by `greedyLargest` in `discover.mjs`.)

---

## 3) Look-back dependencies (`LookbackParams` → `lookback`)

Reinforces: cell `target` depends on exactly `{target − j}` for each jump `j`
with `target − j ≥ 0`. `steps` sits above `target` so there are **forward decoy
cells** the learner must not pick; jumps larger than the target **filter out**.
Predecessor sets below are from `lookbackIndices`.

| id | jumps | target | steps | diff | predecessors | concept driver |
|---|---|---|---|---|---|---|
| `cand-look-1-2-3-at-8` | {1,2,3} | 8 | 12 | 1 | 5,6,7 | clustered neighbours; basic subtraction |
| `cand-look-2-4-6-at-10` | {2,4,6} | 10 | 14 | 2 | 4,6,8 | all-even preds; reject odd decoys |
| `cand-look-3-5-8-at-14` | {3,5,8} | 14 | 18 | 3 | 6,9,11 | spread-out preds, big 8-jump |
| `cand-look-2-7-9-at-13` | {2,7,9} | 13 | 17 | 3 | 4,6,11 | uneven strides, scattered preds |
| `cand-look-4-6-11-at-15` | {4,6,11} | 15 | 19 | 3 | 4,9,11 | long 11-jump reaches near start |
| `cand-look-5-9-14-at-14` | {5,9,14} | 14 | 18 | 4 | 0,5,9 | **jump == target ⇒ cell 0 is a predecessor** (easy miss) |
| `cand-look-3-6-12-at-12` | {3,6,12} | 12 | 16 | 4 | 0,6,9 | jump==target edge + all multiples of 3 |
| `cand-look-4-7-15-at-11` | {4,7,15} | 11 | 15 | 4 | 4,7 | **15 > 11 ⇒ filtered out** (11−15<0); only 2 preds |

---

## 4) Coin change (`CoinSumParams` → `coin-change`)

### 4a) Plain exact-sum (no `fewest`)

No `1` coin and larger targets, so *reaching* the target exactly is the puzzle.
The grader accepts any exact-sum combination. All reachable (verified).

| id | coins | target | diff | example exact combos | concept driver |
|---|---|---|---|---|---|
| `cand-coin-3-7-t27` | {3,7} | 27 | 3 | 3×9 **or** 3+3+7+7+7 | reachability without a 1-coin (2 valid combos) |
| `cand-coin-4-9-t30` | {4,9} | 30 | 3 | 4+4+4+9+9 | unique combo; remainder must divide into 4s |
| `cand-coin-5-8-t39` | {5,8} | 39 | 4 | 5+5+5+8+8+8 | larger target, unique combo |
| `cand-coin-6-10-t38` | {6,10} | 38 | 4 | 6+6+6+10+10 | both even; pick 10-count whose remainder splits into 6s |

### 4b) Fewest (`fewest: true`) — documented greedy traps

For each: **greedy-largest count vs true optimum**, plus the optimal first coin
and its uniqueness, all from `minCoinsTable` / `optimalFirstCoins`.

| id | coins | target | diff | greedy-largest | optimum (min coins) | optimal first coin |
|---|---|---|---|---|---|---|
| `cand-coin-1-4-5-t8-fewest` | {1,4,5} | 8 | 2 | 5+1+1+1 = **4** | 4+4 = **2** | **4** (unique) |
| `cand-coin-1-6-7-t24-fewest` | {1,6,7} | 24 | 3 | 7+7+7+1+1+1 = **6** | 6+6+6+6 = **4** | **6** (unique) |
| `cand-coin-1-5-8-t10-fewest` | {1,5,8} | 10 | 2 | 8+1+1 = **3** | 5+5 = **2** | **5** (unique) |
| `cand-coin-1-9-10-t27-fewest` | {1,9,10} | 27 | 3 | 10+10+1×7 = **9** | 9+9+9 = **3** | **9** (unique) — extreme gap |
| `cand-coin-3-5-t11-fewest` | {3,5} | 11 | 4 | 5+5 **STRANDS** (rem 1 unmakeable) | 5+3+3 = **3** | **NOT unique** (3 or 5) — *stranding* trap, not a first-coin trap |
| `cand-coin-1-7-8-t21-fewest` | {1,7,8} | 21 | 3 | 8+8+1×5 = **7** | 7+7+7 = **3** | **7** (unique) |

> Note on `cand-coin-3-5-t11-fewest`: this is included as a *greedy-stranding*
> trap (greedy grabs 5+5 then can't finish the leftover 1, because there is no
> 1-coin) — analogous to the shipped `rb-coin-parking-4-5-12`. The optimal first
> coin is **deliberately not** claimed unique here; the `coinSum` grader only
> requires a minimum-length exact-sum, so this is valid, but I'm flagging it
> honestly rather than overstating a unique-first-coin trap.

---

## 5) Optimal first choice (`MinChoiceParams` → `optimal-choice`)

Reinforces: `best[a] = min over coins of 1 + best[a − c]`. **Every one is a
greedy-biggest trap with a UNIQUE optimal first coin** (`optimalFirstCoins`
length === 1, asserted in the test).

| id | coins | amount | diff | greedy-largest path | optimum | **unique** optimal first coin |
|---|---|---|---|---|---|---|
| `cand-min-1-4-5-a8` | {1,4,5} | 8 | 2 | 5+1+1+1 = 4 | 4+4 = 2 | **4** |
| `cand-min-1-6-7-a24` | {1,6,7} | 24 | 3 | 7+7+7+1+1+1 = 6 | 6+6+6+6 = 4 | **6** |
| `cand-min-1-7-8-a21` | {1,7,8} | 21 | 3 | 8+8+1×5 = 7 | 7+7+7 = 3 | **7** |
| `cand-min-1-9-10-a27` | {1,9,10} | 27 | 3 | 10+10+1×7 = 9 | 9+9+9 = 3 | **9** (extreme) |
| `cand-min-2-7-a8` | {2,7} | 8 | 3 | 7 **strands** (rem 1) | 2+2+2+2 = 4 | **2** (only valid start) |
| `cand-min-3-7-a9` | {3,7} | 9 | 3 | 7 **strands** (rem 2) | 3+3+3 = 3 | **3** (only valid start) |
| `cand-min-1-6-8-a18` | {1,6,8} | 18 | 3 | 8+8+1+1 = 4 | 6+6+6 = 3 | **6** |
| `cand-min-1-8-9-a24` | {1,8,9} | 24 | 3 | 9+9+1×6 = 8 | 8+8+8 = 3 | **8** |

`cand-min-2-7-a8` and `cand-min-3-7-a9` are *no-1-coin stranding* traps where
the greedy biggest coin leaves an impossible remainder, yet the optimal first
coin is still unique — a nice complement to the overshoot traps.

---

## 6) Recurrence in code (`CodeBlanks` → `recurrence-code`)

Author-specified answers, all within taught recurrences. **One token id per
blank** (no token reused across blanks — asserted in the test).

| id | diff | what it teaches | correct fills |
|---|---|---|---|
| `cand-code-stair-reach` | 2 | staircase reachability (OR feasibility) | `ground=0`, `lookback=i - s`, `current=i` |
| `cand-code-countways-coins` | 3 | counting ordered ways (SUM combine) | `seed=1`, `op=+=`, `lookback=a - c` |
| `cand-code-min-steps` | 3 | fewest moves to climb (1 + min) | `seed=0`, `op=min`, `plus=1`, `lookback=i - s` |
| `cand-code-reach-or` | 2 | reachability written as explicit `or` of self + predecessor | `op=or`, `lookback=i - s` |
| `cand-code-coin-feasible` | 1 | coin feasibility base case + look-back amount | `base=0`, `lookback=a - c` |
| `cand-code-mincoins-init` | 3 | why the table inits to INF + the +1 per coin | `init=INF`, `plus=1` |

Each slide includes distractor tokens (`i + s`, `a + c`, `max`, `and`, …) so a
wrong mental model (look-forward, wrong combine) is selectable but graded wrong.

---

## 7) Spotting the pattern (`MultipleChoice` → `pattern-reasoning`)

| id | diff | question focus | correct option |
|---|---|---|---|
| `cand-mcq-base-zero` | 2 | base case of fewest-coins table | `best[0] = 0` (no coins make 0) |
| `cand-mcq-reach-or` | 2 | reachability combine with jumps {3,5} at cell 8 | OR of cell 5 / cell 3 |
| `cand-mcq-count-sum` | 3 | counting ways combine with steps {1,2} | SUM (Fibonacci recurrence) |
| `cand-mcq-lookback-direction` | 2 | what bottom-up cell 10 may read with jumps {2,6} | look-backs 8 and 4 (already filled) |
| `cand-mcq-greedy-146` | 3 | where greedy fails for {1,4,6} | amount 8: greedy 6+1+1=3 vs 4+4=2 |
| `cand-mcq-plus-one-role` | 4 | role of `+1` in `1 + min best[a−c]` | counts the single coin laid down now |

`cand-mcq-greedy-146` verified: for {1,4,6}, `best[8]=2` (4+4) while greedy takes
6+1+1=3; at 12 greedy 6+6 is optimal, at 6 a single coin is optimal — so the
only failing amount among the options is 8. ✓

---

## Files

- `scratch/candidate-problems.ts` — typed arrays (`reachabilityCandidates`,
  `pathCandidates`, `lookbackCandidates`, `coinSumCandidates`,
  `minChoiceCandidates`, `conceptCandidates`). Passes `tsc`.
- `scratch/candidate-problems.md` — this document.
- `scratch/discover.mjs` — engine-mirror discovery/verification harness.
- `scratch/candidate-problems.test.ts` — end-to-end grader proof (run with
  `npx vitest run --config scratch/vitest.config.ts`).
- `scratch/tsconfig.check.json` — type-check config for the candidate file.
