<script setup lang="ts">
import { computed } from 'vue'
import ProgressBar from 'primevue/progressbar'

const props = defineProps<{
  totalWaves: number
  scriptsInPlan: number
  totalInputScripts: number
  maxWaveSize: number
  efficiency: number
}>()

const efficiencyPercent = computed(() => Math.round(props.efficiency * 100))

const efficiencyLabel = computed(() => {
  if (props.efficiency >= 0.75) return 'Excellent'
  if (props.efficiency >= 0.5) return 'Good'
  if (props.efficiency >= 0.25) return 'Moderate'
  return 'Low'
})
</script>

<template>
  <section
    class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 flex flex-col gap-2 shrink-0"
  >
    <h3 class="text-sm font-semibold text-slate-600 dark:text-slate-300">
      Statistics
    </h3>

    <dl class="grid grid-cols-2 gap-y-1 gap-x-4 text-sm">
      <dt class="text-slate-500 dark:text-slate-400">Total waves</dt>
      <dd class="font-semibold text-slate-800 dark:text-slate-100 text-right">
        {{ totalWaves }}
      </dd>

      <dt class="text-slate-500 dark:text-slate-400">Scripts in plan</dt>
      <dd class="font-semibold text-slate-800 dark:text-slate-100 text-right">
        {{ scriptsInPlan }} / {{ totalInputScripts }}
      </dd>

      <dt class="text-slate-500 dark:text-slate-400">Max scripts per wave</dt>
      <dd class="font-semibold text-slate-800 dark:text-slate-100 text-right">
        {{ maxWaveSize }}
      </dd>
    </dl>

    <div class="flex flex-col gap-1">
      <div class="flex items-baseline justify-between">
        <span class="text-sm text-slate-500 dark:text-slate-400">Efficiency</span>
        <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {{ efficiency.toFixed(2) }}
          <span class="text-xs text-slate-500 font-normal">({{ efficiencyLabel }})</span>
        </span>
      </div>
      <ProgressBar :value="efficiencyPercent" :show-value="false" />
    </div>
  </section>
</template>
