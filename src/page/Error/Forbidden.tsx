import { Link } from 'react-router-dom'
import { ShieldX, Home, ArrowLeft } from 'lucide-react'

const Forbidden = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <ShieldX className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="mb-3 text-5xl font-bold text-gray-900">403</h1>
        <h2 className="mb-2 text-2xl font-semibold text-gray-800">Access Forbidden</h2>
        <p className="mb-8 max-w-md mx-auto text-gray-600">
          You don't have permission to access this resource. Please contact your administrator if you believe this is
          an error.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default Forbidden

