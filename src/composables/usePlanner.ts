import { computed, ref } from 'vue'
import { buildExecutionPlan } from '@/core/planExecution'
import type { ExecutionPlan, VulnerabilityScript } from '@/core/types'

const EXAMPLE: VulnerabilityScript[] = [
  { scriptId: 1, dependencies: [] },
  { scriptId: 2, dependencies: [1] },
  { scriptId: 3, dependencies: [1, 2] },
  { scriptId: 4, dependencies: [99] },
]

export function usePlanner() {
  const inputText = ref(JSON.stringify(EXAMPLE, null, 2))
  const plan = ref<ExecutionPlan | null>(null)
  const parseError = ref<string | null>(null)

  const totalInputScripts = computed(() => {
    try {
      const parsed = JSON.parse(inputText.value)
      return Array.isArray(parsed) ? parsed.length : 0
    } catch {
      return 0
    }
  })

  const scriptsInPlan = computed(
    () => plan.value?.waves.reduce((n, w) => n + w.length, 0) ?? 0
  )

  const maxWaveSize = computed(() =>
    plan.value?.waves.length ? Math.max(...plan.value.waves.map((w) => w.length)) : 0
  )

  function buildPlan() {
    parseError.value = null
    try {
      const parsed = JSON.parse(inputText.value)
      if (!Array.isArray(parsed)) {
        throw new Error('Input must be a JSON array of scripts')
      }
      plan.value = buildExecutionPlan(parsed as VulnerabilityScript[])
    } catch (err) {
      parseError.value = err instanceof Error ? err.message : 'Invalid JSON'
      plan.value = null
    }
  }

  function loadExample() {
    inputText.value = JSON.stringify(EXAMPLE, null, 2)
    parseError.value = null
    plan.value = null
  }

  function reset() {
    inputText.value = ''
    plan.value = null
    parseError.value = null
  }

  return {
    inputText,
    plan,
    parseError,
    totalInputScripts,
    scriptsInPlan,
    maxWaveSize,
    buildPlan,
    loadExample,
    reset,
  }
}
