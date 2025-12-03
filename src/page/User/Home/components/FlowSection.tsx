const steps = [
  {
    id: 1,
    title: 'Login',
    description: 'Sign in with your university account (K19+) or FPT email for K18 students and lecturers.',
  },
  {
    id: 2,
    title: 'Home & select campus',
    description: 'Start from the Home Page, choose your campus (HCM or NVH) to see relevant facilities.',
  },
  {
    id: 3,
    title: 'Select facility & time',
    description: 'Browse classrooms, labs, and sport areas with live available time slots.',
  },
  {
    id: 4,
    title: 'Facility detail & booking',
    description: 'Review room capacity, equipment and rules, then send a booking request.',
  },
  {
    id: 5,
    title: 'Admin approval',
    description: 'Facility admin approves or rejects your request, based on policy and conflicts.',
  },
  {
    id: 6,
    title: 'Back to Home',
    description: 'Receive notifications on the Home Page about booking status and upcoming usage.',
  },
]

const FlowSection = () => {
  return (
    <section className="bg-gray-50 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Booking flow for students & lecturers</h2>
            <p className="mt-1 text-sm text-gray-600">
              From first login to confirmed booking, the system guides you step by step.
            </p>
          </div>
          <p className="max-w-xs text-xs text-gray-500">
            This flow is shared for both HCM and NVH campuses, ensuring consistent experience across locations.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className="group relative overflow-hidden rounded-xl border border-orange-100 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">
                  {step.id}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-orange-500">
                  {step.id <= 2 ? 'Start' : step.id <= 4 ? 'Booking' : 'Result'}
                </span>
              </div>
              <h3 className="mb-1 text-sm font-semibold text-gray-900">{step.title}</h3>
              <p className="text-xs text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FlowSection


