import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="navbar glass">
      <NavLink className="nav-brand" to="/">
        ExpenseFlow
      </NavLink>
      <nav className="nav-links" aria-label="Primary navigation">
        <NavLink className="nav-link" to="/">
          Dashboard
        </NavLink>
        <NavLink className="nav-link" to="/transactions">
          Transactions
        </NavLink>
      </nav>
      <div className="nav-user">
        <span className="avatar-badge" title={user?.name}>
          {user?.avatar || 'U'}
        </span>
        <button className="btn btn-secondary btn-small" type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  )
}
