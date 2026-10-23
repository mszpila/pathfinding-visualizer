import { useEffect, useRef } from 'react'
import { aStar } from './algorithms/aStar'
import { Board } from './components/Board'
import { Navbar } from './components/Navbar'
import { useGrid } from './hooks/useGrid'
import { useVisualizer } from './hooks/useVisualizer'

function App() {
  const { grid, onCellDown, onCellEnter, clearBoard } = useGrid()
  const { visited, path, hasRun, run, clear } = useVisualizer(aStar)

  const endpoints = useRef({ start: grid.start, end: grid.end })
  useEffect(() => {
    const moved = endpoints.current.start !== grid.start || endpoints.current.end !== grid.end
    endpoints.current = { start: grid.start, end: grid.end }
    if (moved && hasRun) run(grid, true)
  }, [grid, hasRun, run])

  const actions = [
    { label: 'Start', onClick: () => run(grid) },
    {
      label: 'Clear Board',
      onClick: () => {
        clear()
        clearBoard()
      },
    },
    { label: 'Clear Path', onClick: clear },
  ]

  return (
    <>
      <Navbar title="Pathfinding Visualiser" actions={actions} />
      <div className="description">Build your maze and click Start</div>
      <Board
        grid={grid}
        visited={visited}
        path={path}
        onCellDown={onCellDown}
        onCellEnter={onCellEnter}
      />
    </>
  )
}

export default App
