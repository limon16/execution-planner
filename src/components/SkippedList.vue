<script setup lang="ts">
import type { SkippedScript } from '@/core/types'

defineProps<{
  items: SkippedScript[]
}>()
</script>

<template>
  <div v-if="items.length" class="flex items-center gap-2 shrink-0">
    <span class="text-xs font-semibold text-red-500 dark:text-red-400 shrink-0">
      <i class="pi pi-exclamation-triangle text-xs mr-1" />Skipped
    </span>
    <div class="flex items-center gap-1 flex-wrap">
      <span
        v-for="item in items"
        :key="item.scriptId"
        class="inline-flex items-center gap-1 rounded border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:text-red-300"
        :title="item.reason"
      >
        <span>#{{ item.scriptId }}</span>
        <span class="text-red-400 dark:text-red-500 font-normal">
          ({{ item.reason }})
        </span>
      </span>
    </div>
  </div>
</template>
