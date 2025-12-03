import { CalendarRange, MapPin, Clock, Bell } from 'lucide-react'

const cards = [
  {
    title: 'Plan your day around real rooms',
    description: 'Quickly see which classrooms, labs or sport areas are available before you design your schedule.',
    icon: CalendarRange,
  },
  {
    title: 'Choose the right campus and space',
    description: 'Filter by HCM or NVH campus and focus on facilities that match your teaching or learning needs.',
    icon: MapPin,
  },
  {
    title: 'Avoid clashes and wasted trips',
    description: 'The system highlights free time slots so you do not arrive at a room that is already occupied.',
    icon: Clock,
  },
  {
    title: 'Stay informed from one place',
    description: 'From the Home Page you can see upcoming bookings and important notices about your facilities.',
    icon: Bell,
  },
]

const FeatureSection = () => {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">What we will give you</h2>
          <p className="mt-2 text-sm text-gray-600">
            As a student or lecturer, this page is your starting point to understand the campus, find the right
            facilities and act quickly.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {cards.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="flex gap-4 rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-5 shadow-sm"
            >
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-orange-600">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="mb-1 text-sm font-semibold text-gray-900">{title}</h3>
                <p className="text-xs text-gray-600">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeatureSection


