import { Link } from 'react-router-dom'

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-10 border-t bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
              About Us
            </p>
            <p className="text-sm font-semibold text-white">FPTU Multi‑campus Facility Booking</p>
            <p className="text-xs text-gray-400">
              A comprehensive booking system designed for students and lecturers to explore, request and manage facility
              usage across HCM & NVH campuses. Streamline your study, teaching and event planning with real-time
              availability and smart scheduling.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Navigation</p>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-orange-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/user/facilities" className="hover:text-orange-400 transition-colors">
                  Facilities
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Contact Us</p>
            <div className="space-y-2 text-gray-400">
              <p>
                <span className="font-semibold text-gray-300">Email:</span>{' '}
                <a href="mailto:facility.support@fpt.edu.vn" className="hover:text-orange-400 transition-colors">
                  facility.support@fpt.edu.vn
                </a>
              </p>
              <p>
                <span className="font-semibold text-gray-300">HCM Campus:</span> District 9, Ho Chi Minh City
              </p>
              <p>
                <span className="font-semibold text-gray-300">NVH Campus:</span> Di An Ward, Ho Chi Minh City
              </p>
              <p className="pt-2 text-gray-500">
                For booking support or facility inquiries, please contact the facility office or follow your campus
                guidelines.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-800 pt-4 text-[11px] text-gray-500">
          <p>
            © {year} FPT University HCMC. All rights reserved. Facility Booking System v1.0 – designed for students &
            lecturers of multi‑campus HCM.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer


