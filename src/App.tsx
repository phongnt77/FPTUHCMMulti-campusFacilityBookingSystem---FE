import './App.css'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './page/Student/Dashboard'
import FacilityDetail from './page/Student/FacilityDetail'
import Calendar from './page/Student/Calendar'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/facility" element={<FacilityDetail />} />
        <Route path="/calendar/:id" element={<Calendar />} />
      </Routes>
    </>
  )
}

export default App
