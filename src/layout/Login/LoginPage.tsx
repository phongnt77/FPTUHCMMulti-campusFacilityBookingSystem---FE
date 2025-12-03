import { useState } from 'react'

type LoginOption = 'account' | 'google'

const LoginPage = () => {
  const [option, setOption] = useState<LoginOption>('account')

  return (
    <main className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-5xl gap-10 rounded-2xl bg-white p-8 shadow-xl sm:grid-cols-[1.1fr,1fr] sm:p-10">
          <section>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              FPTU Multi‑campus Facility Booking
            </h1>
            <p className="mb-6 text-sm text-gray-600">
              Sign in to book classrooms, labs, and sport areas across HCM & NVH campuses.
            </p>

            <div className="mb-6 inline-flex rounded-full bg-gray-100 p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setOption('account')}
                className={`rounded-full px-4 py-2 transition ${
                  option === 'account' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600'
                }`}
              >
                University account (K19+ students)
              </button>
              <button
                type="button"
                onClick={() => setOption('google')}
                className={`rounded-full px-4 py-2 transition ${
                  option === 'google' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600'
                }`}
              >
                FPT email (K18 students & lecturers)
              </button>
            </div>

            {option === 'account' ? (
              <form className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700" htmlFor="username">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    placeholder="e.g. se12345"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1"
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-gray-600">
                    <input type="checkbox" className="h-3 w-3 rounded border-gray-300 text-orange-500" />
                    <span>Remember this device</span>
                  </label>
                  <button type="button" className="font-semibold text-orange-600 hover:text-orange-700">
                    Forgot password?
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
                >
                  Sign in with university account
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Use your official FPT email account (<strong>@fpt.edu.vn</strong>) to continue. This option is
                  recommended for K18 students and lecturers.
                </p>
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-red-500 text-[10px] font-bold text-white">
                    G
                  </span>
                  <span>Sign in with FPT email</span>
                </button>
                <p className="text-xs text-gray-500">
                  We only accept accounts that end with <strong>@fpt.edu.vn</strong>. Your email is used for
                  authentication and booking notifications.
                </p>
              </div>
            )}
          </section>

          <aside className="hidden flex-col justify-between rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-purple-600 p-6 text-xs text-orange-50 sm:flex">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-orange-100">
                System highlights
              </p>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <span className="mt-0.5 text-orange-200">•</span>
                  <span>Book classrooms, labs, and sport facilities with real‑time availability.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 text-orange-200">•</span>
                  <span>Integrated approval flow for special events and external activities.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 text-orange-200">•</span>
                  <span>Usage history and booking statistics for better campus planning.</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 rounded-lg bg-white/10 p-4 backdrop-blur">
              <p className="mb-1 text-sm font-semibold text-white">Tips for first‑time users</p>
              <ul className="space-y-1">
                <li>- K19+ students: use your official university account (username & password).</li>
                <li>- K18 students and lecturers: choose “Sign in with FPT email”.</li>
                <li>- Make sure your personal information is updated in your profile after signing in.</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
  )
}

export default LoginPage


