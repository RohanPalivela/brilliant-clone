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
