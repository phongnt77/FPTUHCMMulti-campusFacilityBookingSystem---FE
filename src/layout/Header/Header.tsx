import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LogOut, User } from 'lucide-react'

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="rounded bg-orange-500 px-2 py-1 text-sm font-semibold text-white">FPTU</span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-gray-800">Multi‑campus Facility Booking</span>
            <span className="text-xs text-gray-500">HCM & NVH Campus</span>
          </div>
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium text-gray-600">
          <NavLink
            to="/"
            className={({ isActive }) => `hover:text-orange-600 ${isActive ? 'text-orange-600' : ''}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/facilities"
            className={({ isActive }) => `hover:text-orange-600 ${isActive ? 'text-orange-600' : ''}`}
          >
            Facilities
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {/* User Info */}
              <div className="flex items-center gap-2">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.full_name}
                    className="w-8 h-8 rounded-full border-2 border-orange-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-orange-600" />
                  </div>
                )}
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-800 leading-tight">{user.full_name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-lg border border-orange-500 px-3 py-1.5 text-sm font-semibold text-orange-600 hover:bg-orange-50"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header


