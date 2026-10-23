import type { Coord, GridState } from '../domain/grid'

export interface SearchResult {
  readonly visitedOrder: readonly Coord[]
  readonly path: readonly Coord[]
}

export interface PathfindingAlgorithm {
  readonly name: string
  run(grid: GridState): SearchResult
}
