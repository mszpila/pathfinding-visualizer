import { key, neighbors, sameCoord, type Coord } from '../domain/grid'
import type { PathfindingAlgorithm } from './types'

interface SearchNode {
  coord: Coord
  g: number
  h: number
  parent: SearchNode | null
}

const manhattan = (a: Coord, b: Coord): number =>
  Math.abs(a.row - b.row) + Math.abs(a.col - b.col)

const isBetter = (a: SearchNode, b: SearchNode): boolean => {
  const fa = a.g + a.h
  const fb = b.g + b.h
  return fa < fb || (fa === fb && a.h < b.h)
}

const popBest = (open: SearchNode[]): SearchNode => {
  const bestIndex = open.reduce((best, node, i) => (isBetter(node, open[best]) ? i : best), 0)
  return open.splice(bestIndex, 1)[0]
}

const tracePath = (node: SearchNode): Coord[] => {
  const path: Coord[] = []
  for (let n: SearchNode | null = node; n; n = n.parent) path.push(n.coord)
  return path.reverse()
}

export const aStar: PathfindingAlgorithm = {
  name: 'A*',
  run(grid) {
    const open: SearchNode[] = [{ coord: grid.start, g: 0, h: manhattan(grid.start, grid.end), parent: null }]
    const openByKey = new Map([[key(grid.start), open[0]]])
    const closed = new Set<string>()
    const visitedOrder: Coord[] = []

    while (open.length) {
      const current = popBest(open)
      openByKey.delete(key(current.coord))
      closed.add(key(current.coord))
      visitedOrder.push(current.coord)

      if (sameCoord(current.coord, grid.end)) return { visitedOrder, path: tracePath(current) }

      for (const coord of neighbors(grid, current.coord)) {
        const k = key(coord)
        if (closed.has(k)) continue

        const g = current.g + 1
        const existing = openByKey.get(k)
        if (!existing) {
          const node = { coord, g, h: manhattan(coord, grid.end), parent: current }
          open.push(node)
          openByKey.set(k, node)
        } else if (g < existing.g) {
          existing.g = g
          existing.parent = current
        }
      }
    }

    return { visitedOrder, path: [] }
  },
}
