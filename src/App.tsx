import { Routes, Route } from 'react-router-dom'
import LoginPage from './layout/Login/LoginPage'
import NotFound from './page/Error/NotFound'
import Forbidden from './page/Error/Forbidden'
import ServerError from './page/Error/ServerError'
import Header from './layout/Header/Header'
import Footer from './layout/Footer/Footer'
import UserRoutes from './routes/User Route'
import AdminRoutes from './routes/Admin Route'
import './App.css'

function App() {
  return (
    <Routes>
      {/* Admin Routes - No Header/Footer */}
      <Route path="/admin/*" element={<AdminRoutes />} />
      
      {/* Login Page - Has Header/Footer */}
      <Route
        path="/login"
        element={
          <div className="flex min-h-screen flex-col bg-gray-50">
            <Header />
            <main className="flex-1">
              <LoginPage />
            </main>
            <Footer />
          </div>
        }
      />
      
      {/* Error Pages - Has Header/Footer */}
      <Route
        path="/404"
        element={
          <div className="flex min-h-screen flex-col bg-gray-50">
            <Header />
            <main className="flex-1">
              <NotFound />
            </main>
            <Footer />
          </div>
        }
      />
      <Route
        path="/403"
        element={
          <div className="flex min-h-screen flex-col bg-gray-50">
            <Header />
            <main className="flex-1">
              <Forbidden />
            </main>
            <Footer />
          </div>
        }
      />
      <Route
        path="/500"
        element={
          <div className="flex min-h-screen flex-col bg-gray-50">
            <Header />
            <main className="flex-1">
              <ServerError />
            </main>
            <Footer />
          </div>
        }
      />
      
      {/* User Routes - Has Header/Footer */}
      <Route
        path="/*"
        element={
          <div className="flex min-h-screen flex-col bg-gray-50">
            <Header />
            <main className="flex-1">
              <UserRoutes />
            </main>
            <Footer />
          </div>
        }
      />
      
      {/* Fallback - Has Header/Footer */}
      <Route
        path="*"
        element={
          <div className="flex min-h-screen flex-col bg-gray-50">
            <Header />
            <main className="flex-1">
              <NotFound />
            </main>
            <Footer />
          </div>
        }
      />
    </Routes>
  )
}

export default App
