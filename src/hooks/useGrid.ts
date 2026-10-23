import { useCallback, useEffect, useReducer } from 'react'
import {
  cellKind,
  clearWalls,
  createGrid,
  moveEndpoint,
  setWall,
  type Coord,
  type GridState,
} from '../domain/grid'

type DragMode = 'draw' | 'erase' | 'start' | 'end'

interface State {
  grid: GridState
  drag: DragMode | null
}

type Action =
  | { type: 'press'; coord: Coord }
  | { type: 'enter'; coord: Coord }
  | { type: 'release' }
  | { type: 'clear' }

const applyDrag = (grid: GridState, mode: DragMode, coord: Coord): GridState => {
  switch (mode) {
    case 'draw':
      return setWall(grid, coord, true)
    case 'erase':
      return setWall(grid, coord, false)
    default:
      return moveEndpoint(grid, mode, coord)
  }
}

const modeFor = (kind: ReturnType<typeof cellKind>): DragMode => {
  switch (kind) {
    case 'start':
    case 'end':
      return kind
    case 'wall':
      return 'erase'
    case 'empty':
      return 'draw'
  }
}

const withGrid = (state: State, grid: GridState, drag = state.drag): State =>
  grid === state.grid && drag === state.drag ? state : { grid, drag }

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'press': {
      const drag = modeFor(cellKind(state.grid, action.coord))
      return withGrid(state, applyDrag(state.grid, drag, action.coord), drag)
    }
    case 'enter':
      return state.drag ? withGrid(state, applyDrag(state.grid, state.drag, action.coord)) : state
    case 'release':
      return withGrid(state, state.grid, null)
    case 'clear':
      return withGrid(state, clearWalls(state.grid))
  }
}

export const useGrid = () => {
  const [{ grid }, dispatch] = useReducer(reducer, undefined, () => ({ grid: createGrid(), drag: null }))

  useEffect(() => {
    const release = () => dispatch({ type: 'release' })
    window.addEventListener('mouseup', release)
    return () => window.removeEventListener('mouseup', release)
  }, [])

  const onCellDown = useCallback((coord: Coord) => dispatch({ type: 'press', coord }), [])
  const onCellEnter = useCallback((coord: Coord) => dispatch({ type: 'enter', coord }), [])
  const clearBoard = useCallback(() => dispatch({ type: 'clear' }), [])

  return { grid, onCellDown, onCellEnter, clearBoard }
}
