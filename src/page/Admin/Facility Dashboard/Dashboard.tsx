import { useState, useMemo } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { getPendingBookings, getBookingById, type BookingDetail } from '../../../data/bookingMockData'
import type { BookingStatus } from '../../../types'
import StatsCards from './components/StatsCards'
import BookingCard from './components/BookingCard'
import ActionModal from './components/ActionModal'

const Dashboard = () => {
  const [bookings, setBookings] = useState<BookingDetail[]>(getPendingBookings())
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showModal, setShowModal] = useState(false)

  const handleApprove = (bookingId: string) => {
    setSelectedBooking(getBookingById(bookingId) || null)
    setActionType('approve')
    setShowModal(true)
  }

  const handleReject = (bookingId: string) => {
    setSelectedBooking(getBookingById(bookingId) || null)
    setActionType('reject')
    setRejectionReason('')
    setShowModal(true)
  }

  const confirmAction = () => {
    if (!selectedBooking) return

    const updatedBookings = bookings.map((booking) => {
      if (booking.id === selectedBooking.id) {
        return {
          ...booking,
          status: (actionType === 'approve' ? 'approved' : 'rejected') as BookingStatus,
          rejection_reason: actionType === 'reject' ? rejectionReason : undefined,
          approved_by: actionType === 'approve' ? 'admin1' : undefined,
          approved_at: actionType === 'approve' ? new Date() : undefined,
          updatedAt: new Date()
        }
      }
      return booking
    })

    setBookings(updatedBookings.filter((b) => b.status === 'pending') as BookingDetail[])
    setShowModal(false)
    setSelectedBooking(null)
    setActionType(null)
    setRejectionReason('')
  }

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      byCampus: {
        HCM: bookings.filter((b) => b.facility.campus === 'HCM').length,
        NVH: bookings.filter((b) => b.facility.campus === 'NVH').length
      },
      byType: {
        'meeting-room': bookings.filter((b) => b.facility.type === 'meeting-room').length,
        'lab-room': bookings.filter((b) => b.facility.type === 'lab-room').length,
        'sports-field': bookings.filter((b) => b.facility.type === 'sports-field').length
      }
    }
  }, [bookings])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Bảng điều khiển cơ sở vật chất</h1>
          <p className="text-gray-600">Xem xét và quản lý các yêu cầu đặt phòng đang chờ</p>
        </div>

        <StatsCards
          total={stats.total}
          hcm={stats.byCampus.HCM}
          nvh={stats.byCampus.NVH}
          meetingRooms={stats.byType['meeting-room']}
        />

        {bookings.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Không có đặt phòng đang chờ</h3>
            <p className="mt-2 text-sm text-gray-600">Tất cả yêu cầu đặt phòng đã được xử lý.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>

      <ActionModal
        show={showModal}
        booking={selectedBooking}
        actionType={actionType}
        rejectionReason={rejectionReason}
        onRejectionReasonChange={setRejectionReason}
        onConfirm={confirmAction}
        onCancel={() => {
          setShowModal(false)
          setSelectedBooking(null)
          setActionType(null)
          setRejectionReason('')
        }}
      />
    </div>
  )
}

export default Dashboard
