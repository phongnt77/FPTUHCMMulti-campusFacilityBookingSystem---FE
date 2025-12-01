import './App.css'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './page/Student/Dashboard'
import BookingHistory from './page/Student/BookingHistory'
import BookingManagement from './page/Admin/BookingManagement'

function App() {
  return (
    <>
      <Routes>
        {/* Student/User Routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/my-bookings" element={<BookingHistory />} />
        
        {/* Admin Routes */}
        <Route path="/admin/bookings" element={<BookingManagement />} />
      </Routes>
    </>
  )
}

export default App
