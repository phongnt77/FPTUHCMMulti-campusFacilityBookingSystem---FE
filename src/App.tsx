import { Routes, Route, Link, Navigate } from 'react-router-dom'
import AdminDashboard from './page/Admin/Dashboard'
import FacilityManagement from './page/Admin/FacilityManagement'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/facilities" element={<FacilityManagement />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Hệ thống đặt phòng đa campus
        </h1>
        <p className="text-gray-600 mb-8">FPT University - HCM & NVH Campus</p>
        <div className="space-x-4">
          <Link
            to="/admin/dashboard"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Admin Dashboard
          </Link>
          <Link
            to="/admin/facilities"
            className="inline-block px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
          >
            Quản lý cơ sở vật chất
          </Link>
        </div>
      </div>
    </div>
  )
}

export default App
