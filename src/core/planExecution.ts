import type { ExecutionPlan, SkippedScript, VulnerabilityScript } from './types'

export function buildExecutionPlan(scripts: VulnerabilityScript[]): ExecutionPlan {
  const warnings: string[] = []
  const skipped: SkippedScript[] = []

  if (scripts.length === 0) {
    return { waves: [], warnings, efficiency: 0, skipped }
  }

  const unique = dedupe(scripts, warnings)
  const validIds = new Set(unique.map((s) => s.scriptId))

  const eligible = unique.filter((script) => {
    if (script.dependencies.includes(script.scriptId)) {
      warnings.push(`Script ${script.scriptId} depends on itself`)
      skipped.push({ scriptId: script.scriptId, reason: 'depends on itself' })
      return false
    }
    const missing = script.dependencies.filter((id) => !validIds.has(id))
    if (missing.length > 0) {
      for (const id of missing) {
        warnings.push(`Script ${script.scriptId} depends on missing script ${id}`)
      }
      skipped.push({
        scriptId: script.scriptId,
        reason: `missing ${missing.map((id) => `#${id}`).join(', ')}`,
      })
      return false
    }
    return true
  })

  const { waves, unresolved } = topoSortByLevels(eligible)

  if (unresolved.length > 0) {
    // const sorted = unresolved.sort((a, b) => a - b)
    warnings.push(`Circular dependency detected involving scripts: ${unresolved.join(', ')}`)
    for (const id of unresolved) {
      skipped.push({ scriptId: id, reason: 'circular dependency' })
    }
  }

  const efficiency = waves.length ? Math.round((1 / waves.length) * 100) / 100 : 0

  return { waves, warnings, efficiency, skipped }
}

function dedupe(scripts: VulnerabilityScript[], warnings: string[]): VulnerabilityScript[] {
  const seen = new Set<number>()
  return scripts.filter((script) => {
    if (seen.has(script.scriptId)) {
      warnings.push(`Duplicate scriptId ${script.scriptId} — only the first occurrence is used`)
      return false
    }
    seen.add(script.scriptId)
    return true
  })
}

function topoSortByLevels(scripts: VulnerabilityScript[]) {
  const inDegree = new Map<number, number>()
  const dependents = new Map<number, number[]>()

  for (const { scriptId } of scripts) {
    inDegree.set(scriptId, 0)
    dependents.set(scriptId, [])
  }
  for (const { scriptId, dependencies } of scripts) {
    inDegree.set(scriptId, dependencies.length)
    for (const dep of dependencies) {
      dependents.get(dep)!.push(scriptId)
    }
  }

  const waves: number[][] = []
  let wave = [...inDegree].filter(([, d]) => d === 0).map(([id]) => id).sort((a, b) => a - b)

  while (wave.length) {
    waves.push(wave)
    const next: number[] = []
    for (const id of wave) {
      for (const dep of dependents.get(id)!) {
        const d = inDegree.get(dep)! - 1
        inDegree.set(dep, d)
        if (d === 0) next.push(dep)
      }
      inDegree.delete(id)
    }
    wave = next.sort((a, b) => a - b)
  }

  return { waves, unresolved: [...inDegree.keys()] }
}
