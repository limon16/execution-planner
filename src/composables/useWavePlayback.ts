import { computed, onBeforeUnmount, ref } from 'vue'
import type { ExecutionPlan } from '@/core/types'

export type ScriptStatus = 'pending' | 'running' | 'done'
export type PlaybackStatus = 'idle' | 'playing' | 'done'

const WAVE_DURATION_MS = 1000

export function useWavePlayback(plan: () => ExecutionPlan | null) {
  const status = ref<PlaybackStatus>('idle')
  const scriptStatus = ref(new Map<number, ScriptStatus>())

  let timer: ReturnType<typeof setTimeout> | null = null
  let currentIndex = -1

  const waves = computed(() => plan()?.waves ?? [])

  function setWaveStatus(index: number, s: ScriptStatus) {
    const next = new Map(scriptStatus.value)
    for (const id of waves.value[index] ?? []) next.set(id, s)
    scriptStatus.value = next
  }

  function step() {
    if (status.value !== 'playing') return

    const index = currentIndex + 1
    if (index >= waves.value.length) {
      status.value = 'done'
      return
    }

    currentIndex = index
    setWaveStatus(index, 'running')

    timer = setTimeout(() => {
      setWaveStatus(index, 'done')
      step()
    }, WAVE_DURATION_MS)
  }

  function replay() {
    if (timer) clearTimeout(timer)
    timer = null
    currentIndex = -1
    scriptStatus.value = new Map(waves.value.flat().map((id) => [id, 'pending' as const]))
    if (!waves.value.length) {
      status.value = 'idle'
      return
    }
    status.value = 'playing'
    step()
  }

  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
  })

  return { status, scriptStatus, replay }
}
