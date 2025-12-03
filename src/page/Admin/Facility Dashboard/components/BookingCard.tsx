import { CheckCircle2, XCircle, Calendar, Clock, MapPin, Users, FileText } from 'lucide-react'
import type { BookingDetail } from '../../../../data/bookingMockData'

interface BookingCardProps {
  booking: BookingDetail
  onApprove: (bookingId: string) => void
  onReject: (bookingId: string) => void
}

const BookingCard = ({ booking, onApprove, onReject }: BookingCardProps) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date)
  }

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Academic':
        return 'bg-blue-100 text-blue-700'
      case 'Teaching':
        return 'bg-purple-100 text-purple-700'
      case 'Administrative':
        return 'bg-orange-100 text-orange-700'
      case 'Sports':
        return 'bg-green-100 text-green-700'
      case 'Research':
        return 'bg-indigo-100 text-indigo-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">{booking.facility.name}</h3>
                {booking.category && (
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getCategoryColor(booking.category)}`}
                  >
                    {booking.category}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-600">{booking.purpose}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(booking.startTime)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Time</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm font-medium text-gray-900">
                  {booking.facility.campus} · {booking.facility.location}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users className="mt-0.5 h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Attendees</p>
                <p className="text-sm font-medium text-gray-900">
                  {booking.estimated_attendees || 'N/A'} / {booking.facility.capacity}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-600">
              {booking.user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{booking.user.name}</p>
              <p className="text-xs text-gray-500">
                {booking.user.email} · {booking.user.role === 'student' ? 'Student' : 'Lecturer'}
              </p>
            </div>
          </div>

          {booking.special_requirements && Object.keys(booking.special_requirements).length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <p className="text-xs font-semibold text-gray-700">Special Requirements</p>
              </div>
              <ul className="space-y-1">
                {Object.entries(booking.special_requirements).map(([key, value]) => (
                  <li key={key} className="text-xs text-gray-600">
                    <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                    {typeof value === 'boolean'
                      ? value
                        ? 'Yes'
                        : 'No'
                      : Array.isArray(value)
                        ? value.join(', ')
                        : String(value)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>
              Requested on {formatDate(booking.createdAt)} at {formatTime(booking.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:w-48">
          <button
            onClick={() => onApprove(booking.id)}
            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition-colors"
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve
          </button>
          <button
            onClick={() => onReject(booking.id)}
            className="flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
          >
            <XCircle className="h-4 w-4" />
            Reject
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookingCard

