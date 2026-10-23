export interface Coord {
  readonly row: number
  readonly col: number
}

export type CellKind = 'start' | 'end' | 'wall' | 'empty'
export type Endpoint = 'start' | 'end'

export interface GridState {
  readonly rows: number
  readonly cols: number
  readonly start: Coord
  readonly end: Coord
  readonly walls: ReadonlySet<string>
}

export const ROWS = 18
export const COLS = 50
const DEFAULT_START: Coord = { row: 10, col: 7 }
const DEFAULT_END: Coord = { row: 10, col: 42 }

export const key = ({ row, col }: Coord): string => `${row}-${col}`

export const sameCoord = (a: Coord, b: Coord): boolean =>
  a.row === b.row && a.col === b.col

export const createGrid = (rows = ROWS, cols = COLS): GridState => ({
  rows,
  cols,
  start: DEFAULT_START,
  end: DEFAULT_END,
  walls: new Set(),
})

export const inBounds = (grid: GridState, { row, col }: Coord): boolean =>
  row >= 0 && row < grid.rows && col >= 0 && col < grid.cols

export const cellKind = (grid: GridState, coord: Coord): CellKind => {
  if (sameCoord(coord, grid.start)) return 'start'
  if (sameCoord(coord, grid.end)) return 'end'
  return grid.walls.has(key(coord)) ? 'wall' : 'empty'
}

export const isPassable = (grid: GridState, coord: Coord): boolean =>
  cellKind(grid, coord) !== 'wall'

const DIRECTIONS: readonly Coord[] = [
  { row: 0, col: 1 },
  { row: 0, col: -1 },
  { row: 1, col: 0 },
  { row: -1, col: 0 },
]

export const neighbors = (grid: GridState, { row, col }: Coord): Coord[] =>
  DIRECTIONS.map((d) => ({ row: row + d.row, col: col + d.col })).filter(
    (c) => inBounds(grid, c) && isPassable(grid, c),
  )

export const setWall = (grid: GridState, coord: Coord, present: boolean): GridState => {
  if (cellKind(grid, coord) === 'start' || cellKind(grid, coord) === 'end') return grid
  if (grid.walls.has(key(coord)) === present) return grid
  const walls = new Set(grid.walls)
  if (present) walls.add(key(coord))
  else walls.delete(key(coord))
  return { ...grid, walls }
}

export const moveEndpoint = (grid: GridState, endpoint: Endpoint, coord: Coord): GridState => {
  const other = endpoint === 'start' ? grid.end : grid.start
  if (!inBounds(grid, coord) || sameCoord(coord, other)) return grid
  return { ...grid, [endpoint]: coord }
}

export const clearWalls = (grid: GridState): GridState => ({ ...grid, walls: new Set() })
