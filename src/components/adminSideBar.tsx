import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Building2, Users, LogOut } from 'lucide-react'

const AdminSideBar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-gray-200 bg-white shadow-sm">
      <div className="flex h-full flex-col">
        {/* Logo/Brand */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center gap-2">
            <span className="rounded bg-orange-500 px-2 py-1 text-sm font-semibold text-white">FPTU</span>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-gray-800">Admin Panel</span>
              <span className="text-xs text-gray-500">Facility Booking</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-orange-600'
              }`
            }
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Facility Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/facilities"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-orange-600'
              }`
            }
          >
            <Building2 className="h-5 w-5" />
            <span>Facility Management</span>
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-orange-600'
              }`
            }
          >
            <Users className="h-5 w-5" />
            <span>Users</span>
          </NavLink>
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-200 p-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-red-600">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default AdminSideBar

