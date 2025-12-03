import { Link, NavLink } from 'react-router-dom'

const Header = () => {
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
            to="/user/facilities"
            className={({ isActive }) => `hover:text-orange-600 ${isActive ? 'text-orange-600' : ''}`}
          >
            Facilities
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-lg border border-orange-500 px-3 py-1.5 text-sm font-semibold text-orange-600 hover:bg-orange-50"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header


