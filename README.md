# Execution Planner

Vue 3 component that groups scripts with dependencies into parallel execution waves.

## Run locally

```bash
pnpm install
pnpm run dev      # http://localhost:3000
pnpm run test     # unit tests
pnpm run build    # production build
```

## Run in Docker

```bash
docker build -t execution-planner .
docker run -p 8080:80 execution-planner
# open http://localhost:8080
```

## Structure

```
src/
  components/        — UI (ExecutionPlanner, WaveColumn, StatsPanel, WarningsList, SkippedList, PlaybackControls)
  composables/       — usePlanner (state, JSON parsing), useWavePlayback (animation)
  core/              — planExecution (pure algorithm), types
  tests/             — vitest specs
```

The algorithm is a pure function in `core/planExecution.ts` so it can be tested and reused without Vue.

## Algorithm

Level-based topological sort (Kahn's). On each iteration, take every script whose dependencies are already satisfied — that's the next wave. Repeat until none are left. Anything remaining with unresolved deps is a cycle.

**Validation:** missing dependencies, duplicate `scriptId`s, self-dependencies and cycles produce warnings and exclude the offending scripts from the plan (also exposed as `skipped` for the UI).

**Efficiency:** `1 / waves.length` — `1.0` when everything fits in one wave, lower as the plan becomes more sequential. `0.33` for the example from the task (3 waves × 1 script each).

## Stack

Vue 3 (Composition API, `<script setup>`), TypeScript, Vite, Tailwind CSS, PrimeVue, Vitest.
