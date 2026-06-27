// Discovery + verification harness. Mirrors src/lib/dp.ts and
// src/lib/validation.ts EXACTLY so the numbers I author match the engine the
// app grades with. Run with `node scratch/discover.mjs`.

const UNREACHABLE = Infinity;

function computeReachable(steps, jumpSizes) {
  const reachable = new Array(steps + 1).fill(false);
  reachable[0] = true;
  for (let i = 1; i <= steps; i++) {
    reachable[i] = jumpSizes.some((j) => i - j >= 0 && reachable[i - j]);
  }
  return reachable;
}

function lookbackIndices(n, jumpSizes) {
  return jumpSizes
    .map((j) => n - j)
    .filter((i) => i >= 0)
    .sort((a, b) => a - b);
}

function minCoinsTable(coins, amount) {
  const best = new Array(amount + 1).fill(UNREACHABLE);
  best[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (a - c >= 0 && best[a - c] !== UNREACHABLE) {
        best[a] = Math.min(best[a], best[a - c] + 1);
      }
    }
  }
  return best;
}

function optimalFirstCoins(coins, amount) {
  const best = minCoinsTable(coins, amount);
  if (best[amount] === UNREACHABLE) return [];
  return coins
    .filter(
      (c) =>
        amount - c >= 0 &&
        best[amount - c] !== UNREACHABLE &&
        best[amount - c] + 1 === best[amount],
    )
    .sort((a, b) => a - b);
}

// Greedy-largest count: repeatedly take the biggest coin that fits. Returns
// {count, ok} where ok=false means greedy strands on an unmakeable remainder.
function greedyLargest(coins, target) {
  const sorted = [...coins].sort((a, b) => b - a);
  let rem = target;
  let count = 0;
  const picks = [];
  while (rem > 0) {
    const c = sorted.find((x) => x <= rem);
    if (c === undefined) return { count, ok: false, picks };
    // does taking c still leave a makeable remainder? greedy is naive, it just
    // takes c regardless; we record stranding when no coin fits at the end.
    rem -= c;
    picks.push(c);
    count++;
    if (count > 1000) return { count, ok: false, picks };
  }
  return { count, ok: rem === 0, picks };
}

function exactReachable(coins, target) {
  // can target be made at all (feasibility)?
  return minCoinsTable(coins, target)[target] !== UNREACHABLE;
}

// ---- Reachability boards I want to ship ----
const reach = [
  { id: 'R1', steps: 7, jumps: [1, 2], variant: 'stairs' },
  { id: 'R2', steps: 9, jumps: [2, 3], variant: 'array' },
  { id: 'R3', steps: 13, jumps: [3, 4], variant: 'stairs' },
  { id: 'R4', steps: 14, jumps: [3, 5], variant: 'array' },
  { id: 'R5', steps: 16, jumps: [2, 7], variant: 'stairs' },
  { id: 'R6', steps: 20, jumps: [5, 8], variant: 'array' },
  { id: 'R7', steps: 22, jumps: [4, 9], variant: 'stairs' },
  { id: 'R8', steps: 24, jumps: [6, 10, 15], variant: 'array' },
  { id: 'R9', steps: 12, jumps: [2, 3, 7], variant: 'array' },
  { id: 'R10', steps: 26, jumps: [7, 11], variant: 'stairs' },
];
console.log('==== REACHABILITY ====');
for (const r of reach) {
  const t = computeReachable(r.steps, r.jumps);
  const reachableCells = t.map((v, i) => (v ? i : null)).filter((i) => i !== null);
  const gaps = t.map((v, i) => (!v ? i : null)).filter((i) => i !== null);
  console.log(`${r.id} {${r.jumps}} steps ${r.steps} [${r.variant}]`);
  console.log(`   reachable: ${reachableCells.join(', ')}`);
  console.log(`   gaps:      ${gaps.join(', ') || '(none)'}`);
}

// ---- Path targets ----
const paths = [
  { id: 'P1', jumps: [2, 5], target: 9 },
  { id: 'P2', jumps: [3, 4], target: 10 },
  { id: 'P3', jumps: [2, 7], target: 11 },
  { id: 'P4', jumps: [4, 5], target: 22 },
  { id: 'P5', jumps: [3, 5], target: 14 },
  { id: 'P6', jumps: [6, 7], target: 24 },
  { id: 'P7', jumps: [5, 8], target: 26 },
  { id: 'P8', jumps: [4, 7], target: 22 },
  { id: 'P9', jumps: [3, 8], target: 25 },
  { id: 'P10', jumps: [2, 5], target: 13 },
];
console.log('\n==== PATHS ====');
for (const p of paths) {
  const ok = exactReachable(p.jumps, p.target);
  const g = greedyLargest(p.jumps, p.target);
  // enumerate exact multisets count (small) to report uniqueness
  const ways = countExactMultisets(p.jumps, p.target);
  console.log(
    `${p.id} {${p.jumps}} -> ${p.target}: reachable=${ok}, greedyLargestStrands=${!g.ok} (greedy picks ${g.picks.join('+')}), exactMultisets=${ways.length}`,
  );
  ways.forEach((w) => console.log(`     ${w.join('+')}`));
}

function countExactMultisets(coins, target) {
  // distinct multisets (combinations with repetition) summing to target
  const sorted = [...coins].sort((a, b) => a - b);
  const out = [];
  function rec(idx, rem, acc) {
    if (rem === 0) {
      out.push([...acc]);
      return;
    }
    if (idx >= sorted.length) return;
    const c = sorted[idx];
    // take 0..k of coin c
    let k = 0;
    while (k * c <= rem) {
      for (let i = 0; i < k; i++) acc.push(c);
      rec(idx + 1, rem - k * c, acc);
      for (let i = 0; i < k; i++) acc.pop();
      k++;
    }
  }
  rec(0, target, []);
  return out;
}

// ---- Lookback ----
const looks = [
  { id: 'L1', jumps: [1, 2, 3], target: 8, steps: 12 },
  { id: 'L2', jumps: [2, 4, 6], target: 10, steps: 14 },
  { id: 'L3', jumps: [3, 5, 8], target: 14, steps: 18 },
  { id: 'L4', jumps: [2, 7, 9], target: 13, steps: 17 },
  { id: 'L5', jumps: [4, 6, 11], target: 15, steps: 19 },
  { id: 'L6', jumps: [5, 9, 14], target: 14, steps: 18 },
  { id: 'L7', jumps: [3, 6, 12], target: 12, steps: 16 },
  { id: 'L8', jumps: [4, 7, 15], target: 11, steps: 15 },
];
console.log('\n==== LOOKBACK ====');
for (const l of looks) {
  console.log(`${l.id} {${l.jumps}} target ${l.target} steps ${l.steps} -> preds ${JSON.stringify(lookbackIndices(l.target, l.jumps))}`);
}

// ---- CoinSum plain (feasibility / exact-sum, no fewest) ----
const coinPlain = [
  { id: 'C1', coins: [3, 7], target: 27 },
  { id: 'C2', coins: [4, 9], target: 30 },
  { id: 'C3', coins: [5, 8], target: 39 },
  { id: 'C4', coins: [6, 10], target: 38 },
];
console.log('\n==== COINSUM PLAIN ====');
for (const c of coinPlain) {
  const ways = countExactMultisets(c.coins, c.target);
  console.log(`${c.id} {${c.coins}} t${c.target}: reachable=${exactReachable(c.coins, c.target)}, #multisets=${ways.length}`);
  ways.slice(0, 4).forEach((w) => console.log(`     ${w.join('+')}`));
}

// ---- CoinSum fewest traps (candidates to verify) ----
const coinFewest = [
  { id: 'C5', coins: [1, 4, 5], target: 8 },
  { id: 'C6', coins: [1, 6, 7], target: 24 },
  { id: 'C7', coins: [1, 5, 8], target: 10 },
  { id: 'C8', coins: [1, 9, 10], target: 27 },
  { id: 'C9', coins: [3, 5], target: 11 },
  { id: 'C10', coins: [1, 7, 8], target: 21 },
];
console.log('\n==== COINSUM FEWEST (trap candidates) ====');
for (const c of coinFewest) {
  reportTrap(c.id, c.coins, c.target);
}

// ---- MinChoice trap candidates ----
const minChoice = [
  { id: 'M1', coins: [1, 4, 5], target: 8 },
  { id: 'M2', coins: [1, 6, 7], target: 24 },
  { id: 'M3', coins: [1, 7, 8], target: 21 },
  { id: 'M4', coins: [1, 9, 10], target: 27 },
  { id: 'M5', coins: [2, 7], target: 8 },
  { id: 'M6', coins: [3, 7], target: 9 },
  { id: 'M7', coins: [1, 6, 8], target: 18 },
  { id: 'M8', coins: [1, 5, 9], target: 25 },
];
console.log('\n==== MINCHOICE (trap candidates) ====');
for (const c of minChoice) {
  reportTrap(c.id, c.coins, c.target);
}

function reportTrap(id, coins, target) {
  const best = minCoinsTable(coins, target);
  const opt = best[target];
  const g = greedyLargest(coins, target);
  const first = optimalFirstCoins(coins, target);
  const greedyDesc = g.ok ? `${g.picks.join('+')}=${g.count}` : `STRANDS (${g.picks.join('+')}...)`;
  const trap = (g.ok && g.count > opt) || !g.ok;
  console.log(
    `${id} {${coins}} t${target}: opt=${opt} (${reconstruct(coins, target).join('+')}), greedy=${greedyDesc}, optimalFirstCoins=[${first}] unique=${first.length === 1}, TRAP=${trap}`,
  );
}

function reconstruct(coins, target) {
  const best = minCoinsTable(coins, target);
  if (best[target] === UNREACHABLE) return ['UNREACHABLE'];
  let rem = target;
  const picks = [];
  while (rem > 0) {
    const c = coins.find((x) => rem - x >= 0 && best[rem - x] === best[rem] - 1);
    picks.push(c);
    rem -= c;
  }
  return picks.sort((a, b) => b - a);
}
