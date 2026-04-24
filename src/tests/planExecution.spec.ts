import { describe, expect, it } from 'vitest'
import { buildExecutionPlan } from '@/core/planExecution'
import type { VulnerabilityScript } from '@/core/types'

describe('buildExecutionPlan', () => {
  it('returns empty plan for empty input', () => {
    expect(buildExecutionPlan([])).toEqual({
      waves: [],
      warnings: [],
      efficiency: 0,
      skipped: [],
    })
  })

  it('handles the example from the task specification', () => {
    const input: VulnerabilityScript[] = [
      { scriptId: 1, dependencies: [] },
      { scriptId: 2, dependencies: [1] },
      { scriptId: 3, dependencies: [1, 2] },
      { scriptId: 4, dependencies: [99] },
    ]

    const plan = buildExecutionPlan(input)

    expect(plan.waves).toEqual([[1], [2], [3]])
    expect(plan.warnings).toEqual(['Script 4 depends on missing script 99'])
    expect(plan.efficiency).toBeCloseTo(0.33, 2)
    expect(plan.skipped).toEqual([{ scriptId: 4, reason: 'missing #99' }])
  })

  it('places independent scripts into a single wave', () => {
    const input: VulnerabilityScript[] = [
      { scriptId: 1, dependencies: [] },
      { scriptId: 2, dependencies: [] },
      { scriptId: 3, dependencies: [] },
    ]

    const plan = buildExecutionPlan(input)

    expect(plan.waves).toEqual([[1, 2, 3]])
    expect(plan.warnings).toEqual([])
    expect(plan.efficiency).toBe(1)
  })

  it('groups parallel dependents into the same wave', () => {
    const input: VulnerabilityScript[] = [
      { scriptId: 1, dependencies: [] },
      { scriptId: 2, dependencies: [1] },
      { scriptId: 3, dependencies: [1] },
      { scriptId: 4, dependencies: [2, 3] },
    ]

    const plan = buildExecutionPlan(input)

    expect(plan.waves).toEqual([[1], [2, 3], [4]])
    expect(plan.warnings).toEqual([])
    expect(plan.efficiency).toBeCloseTo(0.33, 2)
  })

  it('sorts scripts within a wave by scriptId for determinism', () => {
    const input: VulnerabilityScript[] = [
      { scriptId: 5, dependencies: [] },
      { scriptId: 1, dependencies: [] },
      { scriptId: 3, dependencies: [] },
    ]

    const plan = buildExecutionPlan(input)

    expect(plan.waves).toEqual([[1, 3, 5]])
  })

  it('respects script input order when ids are unsorted but dependencies form a chain', () => {
    const input: VulnerabilityScript[] = [
      { scriptId: 3, dependencies: [2] },
      { scriptId: 2, dependencies: [1] },
      { scriptId: 1, dependencies: [] },
    ]

    const plan = buildExecutionPlan(input)

    expect(plan.waves).toEqual([[1], [2], [3]])
  })

  it('emits warning and skips script for each missing dependency', () => {
    const input: VulnerabilityScript[] = [
      { scriptId: 1, dependencies: [] },
      { scriptId: 2, dependencies: [77, 88] },
    ]

    const plan = buildExecutionPlan(input)

    expect(plan.waves).toEqual([[1]])
    expect(plan.warnings).toEqual([
      'Script 2 depends on missing script 77',
      'Script 2 depends on missing script 88',
    ])
  })

  it('emits warning for duplicate scriptIds and keeps the first occurrence', () => {
    const input: VulnerabilityScript[] = [
      { scriptId: 1, dependencies: [] },
      { scriptId: 1, dependencies: [2] },
      { scriptId: 2, dependencies: [1] },
    ]

    const plan = buildExecutionPlan(input)

    expect(plan.waves).toEqual([[1], [2]])
    expect(plan.warnings).toEqual([
      'Duplicate scriptId 1 — only the first occurrence is used',
    ])
  })

  it('detects a self-dependency as a cycle and excludes the script', () => {
    const input: VulnerabilityScript[] = [
      { scriptId: 1, dependencies: [] },
      { scriptId: 2, dependencies: [2] },
    ]

    const plan = buildExecutionPlan(input)

    expect(plan.waves).toEqual([[1]])
    expect(plan.warnings).toEqual(['Script 2 depends on itself'])
  })

  it('detects circular dependencies between multiple scripts', () => {
    const input: VulnerabilityScript[] = [
      { scriptId: 1, dependencies: [] },
      { scriptId: 2, dependencies: [3] },
      { scriptId: 3, dependencies: [2] },
    ]

    const plan = buildExecutionPlan(input)

    expect(plan.waves).toEqual([[1]])
    expect(plan.warnings).toEqual([
      'Circular dependency detected involving scripts: 2, 3',
    ])
  })

  it('computes efficiency as 1.0 when all scripts fit into one wave', () => {
    const input: VulnerabilityScript[] = [
      { scriptId: 1, dependencies: [] },
      { scriptId: 2, dependencies: [] },
    ]

    const plan = buildExecutionPlan(input)

    expect(plan.efficiency).toBe(1)
  })

  it('computes efficiency close to 0 for fully sequential plans', () => {
    const input: VulnerabilityScript[] = Array.from({ length: 10 }, (_, i) => ({
      scriptId: i + 1,
      dependencies: i === 0 ? [] : [i],
    }))

    const plan = buildExecutionPlan(input)

    expect(plan.waves.length).toBe(10)
    expect(plan.efficiency).toBeCloseTo(0.1, 2)
  })

  it('handles a complex graph with multiple parallel branches', () => {
    const input: VulnerabilityScript[] = [
      { scriptId: 1, dependencies: [] },
      { scriptId: 2, dependencies: [] },
      { scriptId: 3, dependencies: [1] },
      { scriptId: 4, dependencies: [1, 2] },
      { scriptId: 5, dependencies: [2] },
      { scriptId: 6, dependencies: [3, 4, 5] },
    ]

    const plan = buildExecutionPlan(input)

    expect(plan.waves).toEqual([
      [1, 2],
      [3, 4, 5],
      [6],
    ])
    expect(plan.warnings).toEqual([])
    expect(plan.efficiency).toBeCloseTo(0.33, 2)
  })
})
