import { CheckCircle2, XCircle, Calendar, Clock, MapPin, Users, FileText, Star, AlertTriangle, MessageSquare } from 'lucide-react'
import type { AdminBooking } from '../api/adminBookingApi'

interface BookingCardProps {
  booking: AdminBooking
  onApprove: (bookingId: string) => void
  onReject: (bookingId: string) => void
}

// Helper function to parse date string from backend
// Backend returns format: "dd/MM/yyyy HH:mm:ss" (e.g., "10/12/2025 09:10:11")
const parseDateString = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;
  
  try {
    // Try parsing "dd/MM/yyyy HH:mm:ss" format
    const ddMMyyyyMatch = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
    if (ddMMyyyyMatch) {
      const [, day, month, year, hours, minutes, seconds] = ddMMyyyyMatch;
      return new Date(
        parseInt(year),
        parseInt(month) - 1, // Month is 0-indexed
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
        parseInt(seconds)
      );
    }
    
    // Fallback: try standard Date parsing (for ISO 8601 format)
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    return null;
  } catch {
    return null;
  }
};

const BookingCard = ({ booking, onApprove, onReject }: BookingCardProps) => {
  // Parse date strings từ API (supports "dd/MM/yyyy HH:mm:ss" format)
  const startTime = parseDateString(booking.startTime);
  const endTime = parseDateString(booking.endTime);
  const createdAt = parseDateString(booking.createdAt);

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    try {
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch {
      return 'N/A';
    }
  }

  const formatTime = (date: Date | null) => {
    if (!date) return 'N/A';
    try {
      return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date);
    } catch {
      return 'N/A';
    }
  }

  // Parse specialRequirements từ string (JSON) nếu có
  const parseSpecialRequirements = (): Record<string, any> | null => {
    if (!booking.specialRequirements || booking.specialRequirements.trim() === '') {
      return null
    }
    try {
      return JSON.parse(booking.specialRequirements)
    } catch {
      // Nếu không phải JSON, trả về như một string đơn giản
      return { note: booking.specialRequirements }
    }
  }

  const specialRequirements = parseSpecialRequirements()

  // Chỉ hiển thị nút Approve/Reject nếu booking ở trạng thái Pending_Approval
  const canApproveOrReject = booking.status === 'Pending_Approval'

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending_Approval':
        return 'bg-yellow-100 text-yellow-700'
      case 'Approved':
        return 'bg-green-100 text-green-700'
      case 'Rejected':
        return 'bg-red-100 text-red-700'
      case 'Completed':
        return 'bg-blue-100 text-blue-700'
      case 'Cancelled':
        return 'bg-gray-100 text-gray-700'
      case 'Draft':
        return 'bg-gray-100 text-gray-600'
      case 'No_Show':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Pending_Approval':
        return 'Chờ duyệt'
      case 'Approved':
        return 'Đã duyệt'
      case 'Rejected':
        return 'Đã từ chối'
      case 'Completed':
        return 'Hoàn thành'
      case 'Cancelled':
        return 'Đã hủy'
      case 'Draft':
        return 'Bản nháp'
      case 'No_Show':
        return 'Không đến'
      default:
        return status
    }
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
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold text-gray-900">{booking.facilityName}</h3>
                {booking.category && (
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getCategoryColor(booking.category)}`}
                  >
                    {booking.category}
                  </span>
                )}
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(booking.status)}`}
                >
                  {getStatusLabel(booking.status)}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{booking.purpose}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Ngày</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(startTime)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Giờ</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatTime(startTime)} - {formatTime(endTime)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Facility ID</p>
                <p className="text-sm font-medium text-gray-900">{booking.facilityId}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users className="mt-0.5 h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Số người tham gia</p>
                <p className="text-sm font-medium text-gray-900">
                  {booking.estimatedAttendees || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-600">
              {booking.userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-gray-900">{booking.userName}</p>
                {!booking.studentId && (
                  <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700">
                    Lecturer
                  </span>
                )}
              </div>
              {booking.studentId ? (
                <div className="flex flex-col gap-0.5 mt-1">
                  <p className="text-xs text-gray-500">MSSV: {booking.studentId}</p>
                  {booking.userPhoneNumber ? (
                    <p className="text-xs text-gray-500">SĐT: {booking.userPhoneNumber}</p>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Chưa cập nhật số điện thoại</p>
                  )}
                </div>
              ) : (
                booking.userPhoneNumber && (
                  <p className="text-xs text-gray-500 mt-1">SĐT: {booking.userPhoneNumber}</p>
                )
              )}
            </div>
          </div>

          {specialRequirements && Object.keys(specialRequirements).length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <p className="text-xs font-semibold text-gray-700">Yêu cầu đặc biệt</p>
              </div>
              <ul className="space-y-1">
                {Object.entries(specialRequirements).map(([key, value]) => (
                  <li key={key} className="text-xs text-gray-600">
                    <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                    {typeof value === 'boolean'
                      ? value
                        ? 'Có'
                        : 'Không'
                      : Array.isArray(value)
                        ? value.join(', ')
                        : String(value)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {booking.rejectionReason && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="mb-1 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <p className="text-xs font-semibold text-red-700">Lý do từ chối</p>
              </div>
              <p className="text-xs text-red-600">{booking.rejectionReason}</p>
            </div>
          )}

          {/* Feedback từ người dùng */}
          {booking.feedback && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                  <p className="text-xs font-semibold text-green-700">Đánh giá của người dùng</p>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= booking.feedback!.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-xs font-medium text-gray-600">
                    ({booking.feedback.rating}/5)
                  </span>
                </div>
              </div>
              {booking.feedback.comments && (
                <p className="text-xs text-green-700 italic mb-2">"{booking.feedback.comments}"</p>
              )}
              {booking.feedback.reportIssue && booking.feedback.issueDescription && (
                <div className="mt-2 rounded-lg border border-orange-200 bg-orange-50 p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <AlertTriangle className="h-3 w-3 text-orange-600" />
                    <p className="text-xs font-semibold text-orange-700">Báo cáo sự cố</p>
                  </div>
                  <p className="text-xs text-orange-600">{booking.feedback.issueDescription}</p>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Đánh giá vào {formatDate(parseDateString(booking.feedback.createdAt))} lúc{' '}
                {formatTime(parseDateString(booking.feedback.createdAt))}
              </p>
            </div>
          )}

          {booking.approvedBy && booking.approvedAt && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              <span>
                Đã duyệt bởi {booking.approvedBy} vào {formatDate(parseDateString(booking.approvedAt))} lúc{' '}
                {formatTime(parseDateString(booking.approvedAt))}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>
              Yêu cầu vào {formatDate(createdAt)} lúc {formatTime(createdAt)}
            </span>
          </div>
        </div>

        {canApproveOrReject && (
          <div className="flex flex-col gap-2 lg:w-48">
            <button
              onClick={() => onApprove(booking.bookingId)}
              className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
              Duyệt
            </button>
            <button
              onClick={() => onReject(booking.bookingId)}
              className="flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
            >
              <XCircle className="h-4 w-4" />
              Từ chối
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingCard

