<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'
import WaveColumn from './WaveColumn.vue'
import WarningsList from './WarningsList.vue'
import StatsPanel from './StatsPanel.vue'
import SkippedList from './SkippedList.vue'
import { usePlanner } from '@/composables/usePlanner'
import { useWavePlayback } from '@/composables/useWavePlayback'

const {
  inputText,
  plan,
  parseError,
  totalInputScripts,
  scriptsInPlan,
  maxWaveSize,
  buildPlan: runBuild,
  loadExample,
  reset,
} = usePlanner()

const playback = useWavePlayback(() => plan.value)

function buildPlan() {
  runBuild()
  if (plan.value?.waves.length) playback.replay()
}

const depsById = computed(() => {
  const map = new Map<number, number[]>()
  try {
    const parsed = JSON.parse(inputText.value)
    if (Array.isArray(parsed)) {
      for (const s of parsed) {
        if (s && typeof s.scriptId === 'number' && Array.isArray(s.dependencies)) {
          map.set(s.scriptId, s.dependencies)
        }
      }
    }
  } catch {
    // ignore
  }
  return map
})
</script>

<template>
  <div class="h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 flex flex-col">
    <div class="max-w-7xl w-full mx-auto flex-1 min-h-0 flex flex-col gap-3 px-4 sm:px-6 py-4">
      <header class="flex items-baseline justify-between gap-4 shrink-0">
        <div class="flex items-baseline gap-3">
          <h1 class="text-xl font-bold text-slate-900 dark:text-slate-50">
            Execution Planner
          </h1>
          <p class="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
            Build parallel execution waves from a list of scripts with dependencies.
          </p>
        </div>
      </header>

      <section class="grid grid-cols-1 lg:grid-cols-[1fr_minmax(380px,1fr)] gap-3 flex-1 min-h-0">
        <div
          class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 flex flex-col gap-2 min-h-0"
        >
          <div class="flex items-center justify-between shrink-0">
            <label
              for="input-json"
              class="text-sm font-semibold text-slate-600 dark:text-slate-300"
            >
              Input (JSON array of scripts)
            </label>
            <span class="text-xs text-slate-500 dark:text-slate-400">
              {{ totalInputScripts }} {{ totalInputScripts === 1 ? 'script' : 'scripts' }}
            </span>
          </div>

          <Textarea
            id="input-json"
            v-model="inputText"
            class="font-mono text-sm w-full flex-1 min-h-0 resize-none"
            spellcheck="false"
          />

          <Message v-if="parseError" severity="error" :closable="false" class="shrink-0 !my-0">
            {{ parseError }}
          </Message>

          <div class="flex flex-wrap gap-2 shrink-0">
            <Button label="Build Plan" icon="pi pi-play" severity="primary" size="small" @click="buildPlan" />
            <Button label="Load Example" icon="pi pi-refresh" severity="secondary" size="small" outlined @click="loadExample" />
            <Button label="Reset" icon="pi pi-times" severity="secondary" size="small" text @click="reset" />
          </div>
        </div>

        <div class="flex flex-col gap-3 min-h-0 overflow-y-auto">
          <StatsPanel
            v-if="plan"
            :total-waves="plan.waves.length"
            :scripts-in-plan="scriptsInPlan"
            :total-input-scripts="totalInputScripts"
            :max-wave-size="maxWaveSize"
            :efficiency="plan.efficiency"
          />
          <div
            v-else
            class="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-3 text-xs text-slate-500 dark:text-slate-400 shrink-0"
          >
            Statistics will appear here after you build the plan.
          </div>

          <section
            class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 flex flex-col gap-2 shrink-0"
          >
            <header class="flex items-center justify-between">
              <div class="flex items-baseline gap-2">
                <h2 class="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Execution Waves
                </h2>
                <span class="text-xs text-slate-400 dark:text-slate-500 italic">
                  (animated with 1s delay per wave for visibility)
                </span>
              </div>
              <span v-if="plan" class="text-xs text-slate-500 dark:text-slate-400">
                {{ plan.waves.length }} {{ plan.waves.length === 1 ? 'wave' : 'waves' }}
              </span>
            </header>

            <Button
              v-if="plan && plan.waves.length"
              label="Replay"
              icon="pi pi-replay"
              size="small"
              severity="secondary"
              outlined
              :disabled="playback.status.value === 'playing'"
              class="self-start"
              @click="playback.replay"
            />

            <div v-if="!plan" class="text-sm text-slate-500 dark:text-slate-400 py-2">
              Press <em class="font-semibold">Build Plan</em> to see the execution waves.
            </div>
            <div
              v-else-if="plan.waves.length === 0 && plan.skipped.length === 0"
              class="text-sm text-slate-500 dark:text-slate-400 py-2"
            >
              No scripts could be scheduled. Check the warnings for details.
            </div>
            <div v-else class="flex flex-col gap-2">
              <div v-if="plan.waves.length" class="flex flex-wrap gap-2 items-center">
                <WaveColumn
                  v-for="(wave, index) in plan.waves"
                  :key="index"
                  :wave-number="index + 1"
                  :script-ids="wave"
                  :is-last="index === plan.waves.length - 1"
                  :deps-by-id="depsById"
                  :status-by-id="playback.scriptStatus.value"
                />
              </div>
              <SkippedList v-if="plan.skipped.length" :items="plan.skipped" />
            </div>
          </section>

          <WarningsList v-if="plan && plan.warnings.length" :warnings="plan.warnings" />
        </div>
      </section>
    </div>
  </div>
</template>
