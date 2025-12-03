import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from '../../page/User/Home'
import FacilityPage from '../../page/User/Facility'

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/facilities" element={<FacilityPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default UserRoutes


