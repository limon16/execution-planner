<script setup lang="ts">
import type { ScriptStatus } from '@/composables/useWavePlayback'

defineProps<{
  waveNumber: number
  scriptIds: number[]
  isLast: boolean
  depsById: Map<number, number[]>
  statusById: Map<number, ScriptStatus>
}>()

function chipClass(status: ScriptStatus | undefined): string {
  switch (status) {
    case 'running':
      return 'bg-blue-100 dark:bg-blue-900/50 border-blue-400 text-blue-800 dark:text-blue-200 animate-pulse'
    case 'done':
      return 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-300 text-emerald-700 dark:text-emerald-200 opacity-80'
    default:
      return 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
  }
}
</script>

<template>
  <div class="flex items-center gap-2 shrink-0">
    <div
      class="flex items-center gap-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 px-2 py-1.5"
    >
      <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
        W{{ waveNumber }}
      </span>
      <div class="flex items-center gap-1 flex-wrap">
        <span
          v-for="id in scriptIds"
          :key="id"
          class="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-medium transition-colors"
          :class="chipClass(statusById.get(id))"
        >
          <i
            v-if="statusById.get(id) === 'done'"
            class="pi pi-check text-[10px]"
            aria-hidden="true"
          />
          <span>#{{ id }}</span>
          <span
            v-if="depsById.get(id)?.length"
            class="text-slate-400 dark:text-slate-500 font-normal"
          >
            ← {{ depsById.get(id)!.join(',') }}
          </span>
        </span>
      </div>
    </div>
    <i
      v-if="!isLast"
      class="pi pi-arrow-right text-xs text-slate-400 dark:text-slate-500 shrink-0"
      aria-hidden="true"
    />
  </div>
</template>
