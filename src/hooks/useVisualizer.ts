import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PathfindingAlgorithm, SearchResult } from '../algorithms/types'
import { key, type Coord, type GridState } from '../domain/grid'

const STEP_MS = 10

const toKeys = (coords: readonly Coord[], count: number): ReadonlySet<string> =>
  new Set(coords.slice(0, Math.max(0, count)).map(key))

export const useVisualizer = (algorithm: PathfindingAlgorithm) => {
  const [result, setResult] = useState<SearchResult | null>(null)
  const [step, setStep] = useState(0)
  const timer = useRef<number | undefined>(undefined)

  const stop = useCallback(() => window.clearInterval(timer.current), [])
  useEffect(() => stop, [stop])

  const run = useCallback(
    (grid: GridState, instant = false) => {
      stop()
      const next = algorithm.run(grid)
      const total = next.visitedOrder.length + next.path.length
      setResult(next)

      if (instant) {
        setStep(total)
        return
      }

      let current = 0
      setStep(current)
      timer.current = window.setInterval(() => {
        setStep(++current)
        if (current >= total) stop()
      }, STEP_MS)
    },
    [algorithm, stop],
  )

  const clear = useCallback(() => {
    stop()
    setResult(null)
    setStep(0)
  }, [stop])

  const visitedCount = result ? Math.min(step, result.visitedOrder.length) : 0
  const visited = useMemo(() => toKeys(result?.visitedOrder ?? [], visitedCount), [result, visitedCount])
  const path = useMemo(
    () => toKeys(result?.path ?? [], step - visitedCount),
    [result, step, visitedCount],
  )

  return { visited, path, hasRun: result !== null, run, clear }
}
