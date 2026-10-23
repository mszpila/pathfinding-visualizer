export interface NavAction {
  label: string
  onClick: () => void
}

interface NavbarProps {
  title: string
  actions: readonly NavAction[]
}

export function Navbar({ title, actions }: NavbarProps) {
  return (
    <header className="navbarDiv">
      <nav className="navbar">
        <div className="navbarHeader">
          <div className="title">{title}</div>
        </div>
        <ul className="navbarItems">
          {actions.map(({ label, onClick }) => (
            <li key={label}>
              <button type="button" className="button" onClick={onClick}>
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
