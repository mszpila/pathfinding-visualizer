import { describe, expect, it } from 'vitest'
import { makeGrid } from '../test/grids'
import {
  COLS,
  ROWS,
  cellKind,
  clearWalls,
  createGrid,
  inBounds,
  isPassable,
  key,
  moveEndpoint,
  neighbors,
  sameCoord,
  setWall,
} from './grid'

const grid = makeGrid({ rows: 5, cols: 5, start: { row: 0, col: 0 }, end: { row: 4, col: 4 } })

describe('key', () => {
  it('formats a coord as "row-col"', () => {
    expect(key({ row: 3, col: 12 })).toBe('3-12')
  })
})

describe('sameCoord', () => {
  it('compares by value', () => {
    expect(sameCoord({ row: 1, col: 2 }, { row: 1, col: 2 })).toBe(true)
    expect(sameCoord({ row: 1, col: 2 }, { row: 2, col: 1 })).toBe(false)
  })
})

describe('createGrid', () => {
  it('uses default dimensions and endpoints with no walls', () => {
    const g = createGrid()
    expect(g.rows).toBe(ROWS)
    expect(g.cols).toBe(COLS)
    expect(g.start).toEqual({ row: 10, col: 7 })
    expect(g.end).toEqual({ row: 10, col: 42 })
    expect(g.walls.size).toBe(0)
  })
})

describe('inBounds', () => {
  it('accepts cells on the edges', () => {
    expect(inBounds(grid, { row: 0, col: 0 })).toBe(true)
    expect(inBounds(grid, { row: 4, col: 4 })).toBe(true)
  })

  it('rejects cells just outside', () => {
    expect(inBounds(grid, { row: -1, col: 0 })).toBe(false)
    expect(inBounds(grid, { row: 0, col: -1 })).toBe(false)
    expect(inBounds(grid, { row: 5, col: 0 })).toBe(false)
    expect(inBounds(grid, { row: 0, col: 5 })).toBe(false)
  })
})

describe('cellKind / isPassable', () => {
  const g = makeGrid({ ...grid, walls: ['2-2', '0-0'] })

  it('classifies every kind of cell', () => {
    expect(cellKind(g, { row: 4, col: 4 })).toBe('end')
    expect(cellKind(g, { row: 2, col: 2 })).toBe('wall')
    expect(cellKind(g, { row: 1, col: 1 })).toBe('empty')
  })

  it('gives endpoints precedence over a wall at the same key', () => {
    expect(cellKind(g, { row: 0, col: 0 })).toBe('start')
    expect(isPassable(g, { row: 0, col: 0 })).toBe(true)
  })

  it('treats only walls as impassable', () => {
    expect(isPassable(g, { row: 2, col: 2 })).toBe(false)
    expect(isPassable(g, { row: 1, col: 1 })).toBe(true)
    expect(isPassable(g, { row: 4, col: 4 })).toBe(true)
  })
})

describe('neighbors', () => {
  it('returns all four directions in right, left, down, up order', () => {
    expect(neighbors(grid, { row: 2, col: 2 })).toEqual([
      { row: 2, col: 3 },
      { row: 2, col: 1 },
      { row: 3, col: 2 },
      { row: 1, col: 2 },
    ])
  })

  it('drops out-of-bounds cells at a corner', () => {
    expect(neighbors(grid, { row: 0, col: 0 })).toEqual([
      { row: 0, col: 1 },
      { row: 1, col: 0 },
    ])
  })

  it('drops walls', () => {
    const g = makeGrid({ ...grid, walls: ['2-3', '1-2'] })
    expect(neighbors(g, { row: 2, col: 2 })).toEqual([
      { row: 2, col: 1 },
      { row: 3, col: 2 },
    ])
  })
})

describe('setWall', () => {
  it('adds a wall without mutating the input', () => {
    const next = setWall(grid, { row: 1, col: 1 }, true)
    expect(next.walls.has('1-1')).toBe(true)
    expect(grid.walls.size).toBe(0)
  })

  it('removes a wall without mutating the input', () => {
    const g = makeGrid({ ...grid, walls: ['1-1'] })
    const next = setWall(g, { row: 1, col: 1 }, false)
    expect(next.walls.has('1-1')).toBe(false)
    expect(g.walls.has('1-1')).toBe(true)
  })

  it('returns the same grid when nothing changes', () => {
    const g = makeGrid({ ...grid, walls: ['1-1'] })
    expect(setWall(g, { row: 1, col: 1 }, true)).toBe(g)
    expect(setWall(g, { row: 2, col: 2 }, false)).toBe(g)
  })

  it('refuses to place a wall on an endpoint', () => {
    expect(setWall(grid, grid.start, true)).toBe(grid)
    expect(setWall(grid, grid.end, true)).toBe(grid)
  })
})

describe('moveEndpoint', () => {
  it('moves start and end', () => {
    expect(moveEndpoint(grid, 'start', { row: 1, col: 1 }).start).toEqual({ row: 1, col: 1 })
    expect(moveEndpoint(grid, 'end', { row: 3, col: 3 }).end).toEqual({ row: 3, col: 3 })
  })

  it('refuses to move out of bounds', () => {
    expect(moveEndpoint(grid, 'start', { row: -1, col: 0 })).toBe(grid)
    expect(moveEndpoint(grid, 'end', { row: 4, col: 5 })).toBe(grid)
  })

  it('refuses to move onto the other endpoint', () => {
    expect(moveEndpoint(grid, 'start', grid.end)).toBe(grid)
    expect(moveEndpoint(grid, 'end', grid.start)).toBe(grid)
  })

  it('may cover a wall, which reappears once the endpoint leaves', () => {
    const g = makeGrid({ ...grid, walls: ['1-1'] })
    const covered = moveEndpoint(g, 'start', { row: 1, col: 1 })
    expect(cellKind(covered, { row: 1, col: 1 })).toBe('start')
    expect(covered.walls.has('1-1')).toBe(true)

    const uncovered = moveEndpoint(covered, 'start', { row: 0, col: 0 })
    expect(cellKind(uncovered, { row: 1, col: 1 })).toBe('wall')
  })
})

describe('clearWalls', () => {
  it('removes all walls, keeps endpoints and does not mutate the input', () => {
    const g = makeGrid({ ...grid, walls: ['1-1', '2-2'] })
    const next = clearWalls(g)
    expect(next.walls.size).toBe(0)
    expect(next.start).toBe(g.start)
    expect(next.end).toBe(g.end)
    expect(g.walls.size).toBe(2)
  })
})
