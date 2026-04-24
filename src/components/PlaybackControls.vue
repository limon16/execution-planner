<script setup lang="ts">
import Button from 'primevue/button'
import type { PlaybackStatus } from '@/composables/useWavePlayback'

defineProps<{
  status: PlaybackStatus
}>()

const emit = defineEmits<{
  replay: []
}>()
</script>

<template>
  <div class="flex items-center gap-2">
    <Button
      label="Replay"
      icon="pi pi-replay"
      size="small"
      severity="secondary"
      outlined
      :disabled="status === 'playing'"
      @click="emit('replay')"
    />
  </div>
</template>
