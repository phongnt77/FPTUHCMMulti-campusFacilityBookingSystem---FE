import { Link } from 'react-router-dom'

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-purple-700 text-white">
      <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-purple-900/30 blur-3xl" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-16 text-center lg:py-24">
        <div className="max-w-2xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-100">
            FPT University HCMC · Multi‑campus
          </p>
          <h1 className="text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            Plan your study, teaching and events with{' '}
            <span className="underline decoration-orange-200 decoration-4 underline-offset-4">
              smarter facility booking
            </span>
            .
          </h1>
          <p className="text-sm text-orange-50 sm:text-base">
            One place for students and lecturers to discover available classrooms, labs and sport areas across HCM &
            NVH campuses, request bookings and track approvals in real time.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/login"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-orange-600 shadow-lg shadow-orange-900/30 hover:bg-orange-50"
            >
              Sign in to start booking
            </Link>
            <Link
              to="/user/facilities"
              className="rounded-full border border-orange-100/70 bg-orange-500/10 px-5 py-2.5 text-sm font-semibold text-orange-50 hover:bg-orange-500/20"
            >
              Browse facilities
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection


