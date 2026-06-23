// Ground-truth dynamic-programming helpers shared by widgets and validation.
// reachable[0] = true; reachable[i] = OR over jumps j of reachable[i - j].

export function computeReachable(steps: number, jumpSizes: number[]): boolean[] {
  const reachable = new Array<boolean>(steps + 1).fill(false);
  reachable[0] = true;
  for (let i = 1; i <= steps; i++) {
    reachable[i] = jumpSizes.some((j) => i - j >= 0 && reachable[i - j]);
  }
  return reachable;
}

/** Prior indices that determine step n, i.e. {n - j} for each jump j (>= 0). */
export function lookbackIndices(n: number, jumpSizes: number[]): number[] {
  return jumpSizes
    .map((j) => n - j)
    .filter((i) => i >= 0)
    .sort((a, b) => a - b);
}

/** Sentinel for "amount can't be made" in the fewest-coins table. */
export const UNREACHABLE = Infinity;

/**
 * Fewest coins to make each amount 0..amount.
 * minCoins[0] = 0; minCoins[a] = 1 + min over coins c of minCoins[a - c].
 * Entries that can't be made are `UNREACHABLE` (Infinity).
 */
export function minCoinsTable(coins: number[], amount: number): number[] {
  const best = new Array<number>(amount + 1).fill(UNREACHABLE);
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

export interface KnapsackItemLike {
  weight: number;
  value: number;
}

/**
 * 0/1 knapsack table. table[i][w] = best value using the first i items within
 * weight budget w. Rows 0..items.length, columns 0..capacity. Row 0 is all 0s.
 */
export function knapsackTable(
  items: KnapsackItemLike[],
  capacity: number,
): number[][] {
  const rows = items.length + 1;
  const table: number[][] = Array.from({ length: rows }, () =>
    new Array<number>(capacity + 1).fill(0),
  );
  for (let i = 1; i <= items.length; i++) {
    const { weight, value } = items[i - 1];
    for (let w = 0; w <= capacity; w++) {
      const skip = table[i - 1][w];
      const take = weight <= w ? table[i - 1][w - weight] + value : -Infinity;
      table[i][w] = Math.max(skip, take);
    }
  }
  return table;
}

/** Best achievable value for a 0/1 knapsack with the given capacity. */
export function knapsackOptimal(
  items: KnapsackItemLike[],
  capacity: number,
): number {
  return knapsackTable(items, capacity)[items.length][capacity];
}
