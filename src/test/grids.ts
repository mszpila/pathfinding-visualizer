import type { Coord, GridState } from '../domain/grid'

interface GridSpec {
  rows: number
  cols: number
  start: Coord
  end: Coord
  walls?: readonly string[]
}

export const makeGrid = ({ rows, cols, start, end, walls = [] }: GridSpec): GridState => ({
  rows,
  cols,
  start,
  end,
  walls: new Set(walls),
})
