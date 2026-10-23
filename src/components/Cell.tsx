import { memo } from 'react'
import type { CellKind, Coord } from '../domain/grid'

interface CellProps {
  row: number
  col: number
  kind: CellKind
  visited: boolean
  onPath: boolean
  onDown: (coord: Coord) => void
  onEnter: (coord: Coord) => void
}

const classNameFor = (kind: CellKind, visited: boolean, onPath: boolean): string => {
  if (kind === 'wall') return 'wall'
  const base = kind === 'empty' ? (visited ? null : 'unvisited') : kind
  return [base, visited && 'visited', onPath && 'path'].filter(Boolean).join(' ')
}

export const Cell = memo(function Cell({ row, col, kind, visited, onPath, onDown, onEnter }: CellProps) {
  return (
    <td
      className={classNameFor(kind, visited, onPath)}
      onMouseDown={(e) => {
        e.preventDefault()
        onDown({ row, col })
      }}
      onMouseEnter={() => onEnter({ row, col })}
    />
  )
})
