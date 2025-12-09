import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import type { AdminBooking } from '../api/adminBookingApi'

interface ActionModalProps {
  show: boolean
  booking: AdminBooking | null
  actionType: 'approve' | 'reject' | null
  rejectionReason: string
  onRejectionReasonChange: (reason: string) => void
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

const ActionModal = ({
  show,
  booking,
  actionType,
  rejectionReason,
  onRejectionReasonChange,
  onConfirm,
  onCancel,
  loading = false
}: ActionModalProps) => {
  if (!show || !booking || !actionType) return null

  // Parse ISO date strings từ API
  const startTime = new Date(booking.startTime)
  const endTime = new Date(booking.endTime)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
        {actionType === 'approve' ? (
          <>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Duyệt đặt phòng</h3>
                <p className="text-sm text-gray-600">Xác nhận duyệt yêu cầu đặt phòng này</p>
              </div>
            </div>
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Cơ sở vật chất:</span> {booking.facilityName}
              </p>
              <p className="mt-1 text-sm text-gray-700">
                <span className="font-semibold">Ngày:</span> {formatDate(startTime)} từ{' '}
                {formatTime(startTime)} đến {formatTime(endTime)}
              </p>
              <p className="mt-1 text-sm text-gray-700">
                <span className="font-semibold">Người yêu cầu:</span> {booking.userName}
              </p>
              <p className="mt-1 text-sm text-gray-700">
                <span className="font-semibold">Mục đích:</span> {booking.purpose}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={onCancel}
                disabled={loading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Xác nhận duyệt
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Từ chối đặt phòng</h3>
                <p className="text-sm text-gray-600">Cung cấp lý do từ chối</p>
              </div>
            </div>
            <div className="mb-4 rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Cơ sở vật chất:</span> {booking.facilityName}
              </p>
              <p className="mt-1 text-sm text-gray-700">
                <span className="font-semibold">Ngày:</span> {formatDate(startTime)} từ{' '}
                {formatTime(startTime)} đến {formatTime(endTime)}
              </p>
              <p className="mt-1 text-sm text-gray-700">
                <span className="font-semibold">Người yêu cầu:</span> {booking.userName}
              </p>
              <p className="mt-1 text-sm text-gray-700">
                <span className="font-semibold">Mục đích:</span> {booking.purpose}
              </p>
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Lý do từ chối <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => onRejectionReasonChange(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1"
                required
              />
              {!rejectionReason && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  Lý do từ chối là bắt buộc
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={onCancel}
                disabled={loading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                onClick={onConfirm}
                disabled={!rejectionReason.trim() || loading}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Xác nhận từ chối
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ActionModal

