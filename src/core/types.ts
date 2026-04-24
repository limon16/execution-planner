export interface VulnerabilityScript {
  scriptId: number
  dependencies: number[]
}

export interface SkippedScript {
  scriptId: number
  reason: string
}

export interface ExecutionPlan {
  waves: number[][]
  warnings: string[]
  efficiency: number
  skipped: SkippedScript[]
}
