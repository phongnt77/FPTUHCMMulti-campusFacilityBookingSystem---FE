import { useState, useMemo } from 'react'
import { Search, Trash2, Users, Filter, X } from 'lucide-react'
import { mockUsers, getCampusName, type User } from '../../../data/userMockData'

const UserDashboard = () => {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<User['role'] | 'All'>('All')
  const [campusFilter, setCampusFilter] = useState<number | 'All'>('All')
  const [statusFilter, setStatusFilter] = useState<'Active' | 'Inactive' | 'All'>('All')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user_id.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRole = roleFilter === 'All' || user.role === roleFilter
      const matchesCampus = campusFilter === 'All' || user.campus_id === campusFilter
      const matchesStatus = statusFilter === 'All' || user.status === statusFilter

      return matchesSearch && matchesRole && matchesCampus && matchesStatus
    })
  }, [users, searchTerm, roleFilter, campusFilter, statusFilter])

  const handleDelete = (userId: string) => {
    setUsers(users.filter((user) => user.user_id !== userId))
    setDeleteConfirm(null)
  }

  const getRoleBadgeColor = (role: User['role']) => {
    switch (role) {
      case 'Student':
        return 'bg-blue-100 text-blue-700'
      case 'Lecturer':
        return 'bg-purple-100 text-purple-700'
      case 'Admin':
        return 'bg-red-100 text-red-700'
      case 'Facility_Manager':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const stats = useMemo(() => {
    return {
      total: users.length,
      students: users.filter((u) => u.role === 'Student').length,
      lecturers: users.filter((u) => u.role === 'Lecturer').length,
      admins: users.filter((u) => u.role === 'Admin' || u.role === 'Facility_Manager').length,
      active: users.filter((u) => u.status === 'Active').length,
      inactive: users.filter((u) => u.status === 'Inactive').length
    }
  }, [users])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage and monitor all system users</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>Total Users</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-600">Students</div>
            <p className="mt-1 text-2xl font-bold text-blue-600">{stats.students}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-600">Lecturers</div>
            <p className="mt-1 text-2xl font-bold text-purple-600">{stats.lecturers}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-600">Admins</div>
            <p className="mt-1 text-2xl font-bold text-orange-600">{stats.admins}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-600">Active</div>
            <p className="mt-1 text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-600">Inactive</div>
            <p className="mt-1 text-2xl font-bold text-gray-600">{stats.inactive}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as User['role'] | 'All')}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1"
              >
                <option value="All">All Roles</option>
                <option value="Student">Student</option>
                <option value="Lecturer">Lecturer</option>
                <option value="Admin">Admin</option>
                <option value="Facility_Manager">Facility Manager</option>
              </select>
            </div>

            {/* Campus Filter */}
            <select
              value={campusFilter}
              onChange={(e) => setCampusFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1"
            >
              <option value="All">All Campuses</option>
              <option value="1">HCM Campus</option>
              <option value="2">NVH Campus</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'Active' | 'Inactive' | 'All')}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* Clear Filters */}
            {(roleFilter !== 'All' || campusFilter !== 'All' || statusFilter !== 'All' || searchTerm) && (
              <button
                onClick={() => {
                  setRoleFilter('All')
                  setCampusFilter('All')
                  setStatusFilter('All')
                  setSearchTerm('')
                }}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
                    User ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
                    User Info
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
                    Campus
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
                    Last Login
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
                    Created At
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                      No users found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.user_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">{user.user_id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.full_name}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                              {user.full_name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{user.full_name}</p>
                            <p className="text-xs text-gray-500">{user.user_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">{user.email}</p>
                        {user.phone_number && <p className="text-xs text-gray-500">{user.phone_number}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getRoleBadgeColor(user.role)}`}
                        >
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{getCampusName(user.campus_id)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            user.status === 'Active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {user.last_login ? (
                          <div>
                            <p>{new Date(user.last_login).toLocaleDateString()}</p>
                            <p className="text-gray-400">{new Date(user.last_login).toLocaleTimeString()}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setDeleteConfirm(user.user_id)}
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          disabled={user.role === 'Admin'}
                          title={user.role === 'Admin' ? 'Cannot delete admin users' : 'Delete user'}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredUsers.length}</span> of{' '}
          <span className="font-semibold">{users.length}</span> users
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Confirm Deletion</h3>
            <p className="mb-6 text-sm text-gray-600">
              Are you sure you want to delete user <strong>{getUserById(deleteConfirm)?.full_name}</strong> (
              {deleteConfirm})? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to get user by ID
function getUserById(userId: string) {
  return mockUsers.find((user) => user.user_id === userId)
}

export default UserDashboard

