import { describe, expect, it } from 'vitest'
import { inBounds, isPassable, key, neighbors, sameCoord, type Coord, type GridState } from '../domain/grid'
import { makeGrid } from '../test/grids'
import { aStar } from './aStar'

const manhattan = (a: Coord, b: Coord) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col)

const bfs = (grid: GridState) => {
  const dist = new Map([[key(grid.start), 0]])
  const queue = [grid.start]
  for (let i = 0; i < queue.length; i++) {
    for (const next of neighbors(grid, queue[i])) {
      if (dist.has(key(next))) continue
      dist.set(key(next), dist.get(key(queue[i]))! + 1)
      queue.push(next)
    }
  }
  return { reachable: new Set(dist.keys()), distance: dist.get(key(grid.end)) ?? -1 }
}

const expectValidPath = (grid: GridState, path: readonly Coord[]) => {
  expect(path[0]).toEqual(grid.start)
  expect(path.at(-1)).toEqual(grid.end)
  for (const c of path) {
    expect(inBounds(grid, c)).toBe(true)
    expect(isPassable(grid, c)).toBe(true)
  }
  for (let i = 1; i < path.length; i++) expect(manhattan(path[i - 1], path[i])).toBe(1)
}

const prng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const open = makeGrid({ rows: 6, cols: 8, start: { row: 1, col: 1 }, end: { row: 4, col: 6 } })

describe('aStar', () => {
  it('is named A*', () => {
    expect(aStar.name).toBe('A*')
  })

  it('finds a shortest path on an open grid', () => {
    const { path } = aStar.run(open)
    expectValidPath(open, path)
    expect(path).toHaveLength(manhattan(open.start, open.end) + 1)
  })

  it('handles adjacent start and end', () => {
    const g = makeGrid({ rows: 3, cols: 3, start: { row: 1, col: 1 }, end: { row: 1, col: 2 } })
    expect(aStar.run(g).path).toEqual([g.start, g.end])
  })

  it('detours around walls along a shortest route', () => {
    const g = makeGrid({
      rows: 5,
      cols: 5,
      start: { row: 0, col: 0 },
      end: { row: 0, col: 4 },
      walls: ['0-2', '1-2', '2-2', '3-2'],
    })
    const { path } = aStar.run(g)
    expectValidPath(g, path)
    expect(path).toHaveLength(bfs(g).distance + 1)
    expect(path).toContainEqual({ row: 4, col: 2 })
  })

  it('returns an empty path when the end is unreachable', () => {
    const g = makeGrid({ ...open, walls: ['3-6', '5-6', '4-5', '4-7'] })
    const { path, visitedOrder } = aStar.run(g)
    expect(path).toEqual([])
    expect(new Set(visitedOrder.map(key))).toEqual(bfs(g).reachable)
  })

  it('visits start first, end last and no cell twice', () => {
    const { visitedOrder } = aStar.run(open)
    expect(visitedOrder[0]).toEqual(open.start)
    expect(sameCoord(visitedOrder.at(-1)!, open.end)).toBe(true)
    expect(new Set(visitedOrder.map(key)).size).toBe(visitedOrder.length)
  })

  it('matches BFS shortest distance on random grids', () => {
    const random = prng(42)
    let reachable = 0
    let unreachable = 0
    for (let i = 0; i < 200; i++) {
      const walls: string[] = []
      for (let row = 0; row < 8; row++)
        for (let col = 0; col < 8; col++) if (random() < 0.3) walls.push(key({ row, col }))
      const g = makeGrid({ rows: 8, cols: 8, start: { row: 0, col: 0 }, end: { row: 7, col: 7 }, walls })

      const { path } = aStar.run(g)
      const { distance } = bfs(g)
      if (distance === -1) {
        unreachable++
        expect(path).toEqual([])
      } else {
        reachable++
        expectValidPath(g, path)
        expect(path).toHaveLength(distance + 1)
      }
    }

    expect(reachable).toBeGreaterThan(50)
    expect(unreachable).toBeGreaterThan(50)
  })
})
