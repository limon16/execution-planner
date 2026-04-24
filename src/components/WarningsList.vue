<script setup lang="ts">
import Message from 'primevue/message'

defineProps<{
  warnings: string[]
}>()
</script>

<template>
  <section v-if="warnings.length > 0" class="flex flex-col gap-2">
    <h3 class="text-sm font-semibold text-slate-600 dark:text-slate-300">
      Warnings ({{ warnings.length }})
    </h3>
    <Message
      v-for="(warning, index) in warnings"
      :key="index"
      severity="warn"
      :closable="false"
    >
      {{ warning }}
    </Message>
  </section>
</template>
