import { Navigate, Route, Routes } from 'react-router-dom'
import AdminDashboard from '../../page/Admin/Facility Dashboard'
import FacilityManagement from '../../page/Admin/FacilityManagement'
import UserDashboard from '../../page/Admin/User Dashboard'

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/facilities" element={<FacilityManagement />} />
      <Route path="/users" element={<UserDashboard />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default AdminRoutes

