import { cellKind, key, type Coord, type GridState } from '../domain/grid'
import { Cell } from './Cell'

interface BoardProps {
  grid: GridState
  visited: ReadonlySet<string>
  path: ReadonlySet<string>
  onCellDown: (coord: Coord) => void
  onCellEnter: (coord: Coord) => void
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

export function Board({ grid, visited, path, onCellDown, onCellEnter }: BoardProps) {
  return (
    <table id="board">
      <tbody>
        {range(grid.rows).map((row) => (
          <tr key={row}>
            {range(grid.cols).map((col) => {
              const coord = { row, col }
              return (
                <Cell
                  key={col}
                  row={row}
                  col={col}
                  kind={cellKind(grid, coord)}
                  visited={visited.has(key(coord))}
                  onPath={path.has(key(coord))}
                  onDown={onCellDown}
                  onEnter={onCellEnter}
                />
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
