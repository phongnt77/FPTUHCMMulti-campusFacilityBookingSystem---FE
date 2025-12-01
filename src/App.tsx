import './App.css'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './page/Student/Dashboard'
import Login from './page/Login'
import UserDashboard from './page/UserDashboard'
import FacilityList from './page/FacilityList'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/facilities" element={<FacilityList />} />
        <Route path="/student/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  )
}

export default App
