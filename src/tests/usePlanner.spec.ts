import { describe, expect, it } from 'vitest'
import { usePlanner } from '@/composables/usePlanner'

describe('usePlanner', () => {
  it('pre-populates inputText with the example scripts', () => {
    const { inputText, totalInputScripts } = usePlanner()
    expect(inputText.value).toContain('"scriptId": 1')
    expect(totalInputScripts.value).toBe(4)
  })

  it('builds a plan from valid JSON input', () => {
    const planner = usePlanner()
    planner.inputText.value = JSON.stringify([
      { scriptId: 1, dependencies: [] },
      { scriptId: 2, dependencies: [1] },
    ])
    planner.buildPlan()

    expect(planner.parseError.value).toBeNull()
    expect(planner.plan.value?.waves).toEqual([[1], [2]])
    expect(planner.scriptsInPlan.value).toBe(2)
    expect(planner.maxWaveSize.value).toBe(1)
  })

  it('sets parseError and clears plan for invalid JSON', () => {
    const planner = usePlanner()
    planner.inputText.value = '{ not valid json'
    planner.buildPlan()

    expect(planner.parseError.value).not.toBeNull()
    expect(planner.plan.value).toBeNull()
  })

  it('sets parseError when input is not an array', () => {
    const planner = usePlanner()
    planner.inputText.value = '{"scriptId": 1, "dependencies": []}'
    planner.buildPlan()

    expect(planner.parseError.value).toMatch(/must be a JSON array/)
  })

  it('records warnings when plan has missing dependencies', () => {
    const planner = usePlanner()
    planner.inputText.value = JSON.stringify([{ scriptId: 1, dependencies: [99] }])
    planner.buildPlan()

    expect(planner.plan.value?.warnings.length).toBe(1)
  })

  it('loadExample resets state to the example scripts', () => {
    const planner = usePlanner()
    planner.inputText.value = 'garbage'
    planner.buildPlan()
    planner.loadExample()

    expect(planner.plan.value).toBeNull()
    expect(planner.parseError.value).toBeNull()
    expect(planner.totalInputScripts.value).toBe(4)
  })

  it('reset clears input and plan', () => {
    const planner = usePlanner()
    planner.buildPlan()
    planner.reset()

    expect(planner.inputText.value).toBe('')
    expect(planner.plan.value).toBeNull()
    expect(planner.parseError.value).toBeNull()
  })
})
