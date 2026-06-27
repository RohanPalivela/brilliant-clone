# scratch/ — SRS scheduler simulation

Instrumentation harness that drives the **real** scheduler in `src/lib/srs.ts`
through a simulated learner and prints measured numbers. Nothing here modifies
`src/`; it exists only to characterize behavior.

## Run

```bash
# the simulation (prints tables to stdout)
npx vitest run --config scratch/vitest.config.ts --reporter=verbose

# the repo's real suite (baseline)
npm test
```

`tsx` is installed but cannot run in this sandbox (it needs a unix-domain IPC
socket: `listen EPERM`), so the sim is written as a vitest test instead, which
is also the project's configured runner.

## Files

- `srs-sim.test.ts` — the six simulation scenarios.
- `vitest.config.ts` — scratch-only config (includes `scratch/**`) so the sim
  runs without touching the repo's `vitest.config.ts` (which only includes
  `src/**`).
