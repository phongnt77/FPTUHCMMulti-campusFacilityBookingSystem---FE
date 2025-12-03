import { Navigate, Route, Routes } from 'react-router-dom'
import AdminDashboard from '../../page/Admin/Facility Dashboard'
import FacilityManagement from '../../page/Admin/FacilityManagement'
import UserDashboard from '../../page/Admin/User Dashboard'
import AdminSideBar from '../../components/adminSideBar'

const AdminRoutes = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSideBar />
      <main className="ml-64 flex-1">
        <Routes>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/facilities" element={<FacilityManagement />} />
          <Route path="/users" element={<UserDashboard />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default AdminRoutes

