import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, Users, Star, MessageSquare,
  CheckCircle2, XCircle, Clock3, AlertCircle, ChevronRight,
  Building2, FlaskConical, Trophy, Loader2, X, Send
} from 'lucide-react';
import type { FacilityType } from '../../../types';
import { myBookingsApi, type UserBooking, type BookingStatus } from './api/api';

type FilterStatus = BookingStatus | 'all';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [stats, setStats] = useState({
    total: 0, pending: 0, approved: 0, finish: 0, rejected: 0, cancelled: 0, feedbackGiven: 0
  });

  // Feedback Modal State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<UserBooking | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const [bookingsData, statsData] = await Promise.all([
        myBookingsApi.getMyBookings(filterStatus !== 'all' ? filterStatus : undefined),
        myBookingsApi.getBookingStats()
      ]);
      setBookings(bookingsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const getStatusConfig = (status: BookingStatus) => {
    const configs: Record<string, { label: string; color: string; icon: JSX.Element }> = {
      'Pending': {
        label: 'Chờ duyệt',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: <Clock3 className="w-4 h-4" />
      },
      'Approved': {
        label: 'Đã duyệt',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: <CheckCircle2 className="w-4 h-4" />
      },
      'Finish': {
        label: 'Đã hoàn thành',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: <CheckCircle2 className="w-4 h-4" />
      },
      'Rejected': {
        label: 'Từ chối',
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: <XCircle className="w-4 h-4" />
      },
      'Cancelled': {
        label: 'Đã hủy',
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: <XCircle className="w-4 h-4" />
      },
    };
    return configs[status] || configs['Pending'];
  };

  const getFacilityTypeIcon = (type: FacilityType) => {
    switch (type) {
      case 'Meeting Room':
      case 'meeting-room':
      case 'Classroom':
        return <Building2 className="w-5 h-5" />;
      case 'Laboratory':
      case 'lab-room':
        return <FlaskConical className="w-5 h-5" />;
      case 'Sport Facility':
      case 'sports-field':
        return <Trophy className="w-5 h-5" />;
      default:
        return <Building2 className="w-5 h-5" />;
    }
  };

  const getFacilityTypeColor = (type: FacilityType) => {
    const colors: Record<string, { bg: string; text: string }> = {
      'Classroom': { bg: 'bg-blue-100', text: 'text-blue-600' },
      'Meeting Room': { bg: 'bg-violet-100', text: 'text-violet-600' },
      'meeting-room': { bg: 'bg-violet-100', text: 'text-violet-600' },
      'Laboratory': { bg: 'bg-amber-100', text: 'text-amber-600' },
      'lab-room': { bg: 'bg-amber-100', text: 'text-amber-600' },
      'Sport Facility': { bg: 'bg-emerald-100', text: 'text-emerald-600' },
      'sports-field': { bg: 'bg-emerald-100', text: 'text-emerald-600' },
      'Auditorium': { bg: 'bg-rose-100', text: 'text-rose-600' },
      'Library': { bg: 'bg-cyan-100', text: 'text-cyan-600' },
    };
    return colors[type] || { bg: 'bg-gray-100', text: 'text-gray-600' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const openFeedbackModal = (booking: UserBooking) => {
    setSelectedBooking(booking);
    setRating(5);
    setComment('');
    setFeedbackSuccess(false);
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedBooking) return;

    setSubmittingFeedback(true);
    try {
      const result = await myBookingsApi.submitFeedback({
        bookingId: selectedBooking.id,
        rating,
        comment: comment.trim()
      });

      if (result.success) {
        setFeedbackSuccess(true);
        // Reload bookings to get updated feedback
        setTimeout(() => {
          loadBookings();
        }, 1500);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đặt phòng này?')) return;

    try {
      const result = await myBookingsApi.cancelBooking(bookingId);
      if (result.success) {
        loadBookings();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const renderStars = (count: number, interactive = false, onSelect?: (n: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onSelect?.(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            <Star
              className={`w-6 h-6 ${star <= count ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-orange-600 to-purple-600">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Lịch sử đặt phòng
          </h1>
          <p className="text-white/80 text-sm">
            Xem và quản lý các đơn đặt phòng của bạn
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
          {[
            { label: 'Tổng đơn', value: stats.total, color: 'bg-gray-100 text-gray-700' },
            { label: 'Chờ duyệt', value: stats.pending, color: 'bg-yellow-100 text-yellow-700' },
            { label: 'Đã duyệt', value: stats.approved, color: 'bg-blue-100 text-blue-700' },
            { label: 'Đã hoàn thành', value: stats.finish, color: 'bg-green-100 text-green-700' },
            { label: 'Từ chối', value: stats.rejected, color: 'bg-red-100 text-red-700' },
            { label: 'Đã hủy', value: stats.cancelled, color: 'bg-orange-100 text-orange-700' },
            { label: 'Đã đánh giá', value: stats.feedbackGiven, color: 'bg-purple-100 text-purple-700' }
          ].map((stat) => (
            <div key={stat.label} className={`${stat.color} rounded-xl p-4 text-center`}>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs font-medium opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'Pending', label: 'Chờ duyệt' },
              { key: 'Approved', label: 'Đã duyệt' },
              { key: 'Finish', label: 'Đã hoàn thành' },
              { key: 'Rejected', label: 'Từ chối' },
              { key: 'Cancelled', label: 'Đã hủy' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key as FilterStatus)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === tab.key
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có đơn đặt phòng nào
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {filterStatus === 'all' 
                ? 'Bạn chưa đặt phòng nào. Hãy bắt đầu đặt phòng ngay!'
                : 'Không có đơn đặt phòng nào với trạng thái này'}
            </p>
            <Link
              to="/facilities"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Đặt phòng ngay
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const statusConfig = getStatusConfig(booking.status);
              const facilityColors = getFacilityTypeColor(booking.facility.type);
              const canFeedback = booking.status === 'Finish' && !booking.feedback;
              const canCancel = booking.status === 'Pending' || booking.status === 'Approved';

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Facility Icon */}
                      <div className={`flex-shrink-0 w-14 h-14 rounded-xl ${facilityColors.bg} ${facilityColors.text} flex items-center justify-center`}>
                        {getFacilityTypeIcon(booking.facility.type)}
                      </div>

                      {/* Booking Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {booking.facility.name}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{formatDate(booking.date)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{booking.startTime} - {booking.endTime}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{booking.facility.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>{booking.numberOfPeople} người</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-500 mt-2">
                          <span className="font-medium">Mục đích:</span> {booking.purpose}
                        </p>

                        {/* Rejection Reason */}
                        {booking.status === 'Rejected' && booking.rejectionReason && (
                          <div className="mt-2 flex items-start gap-2 p-2 bg-red-50 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">
                              <span className="font-medium">Lý do:</span> {booking.rejectionReason}
                            </p>
                          </div>
                        )}

                        {/* Existing Feedback */}
                        {booking.feedback && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-green-800">Đánh giá của bạn:</span>
                              {renderStars(booking.feedback.rating)}
                            </div>
                            {booking.feedback.comment && (
                              <p className="text-sm text-green-700 italic">"{booking.feedback.comment}"</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex lg:flex-col gap-2 lg:items-end">
                        {canFeedback && (
                          <button
                            onClick={() => openFeedbackModal(booking)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                          >
                            <Star className="w-4 h-4" />
                            Đánh giá
                          </button>
                        )}
                        {canCancel && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            Hủy đặt
                          </button>
                        )}
                        <span className="text-xs text-gray-400">
                          Mã: {booking.id}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
              onClick={() => !submittingFeedback && !feedbackSuccess && setShowFeedbackModal(false)}
            />

            <div className="relative inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-2xl shadow-xl">
              {!feedbackSuccess ? (
                <>
                  {/* Modal Header */}
                  <div className="px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                          <Star className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-white">
                          Đánh giá trải nghiệm
                        </h3>
                      </div>
                      {!submittingFeedback && (
                        <button
                          onClick={() => setShowFeedbackModal(false)}
                          className="text-white/80 hover:text-white transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Modal Content */}
                  <div className="px-6 py-5">
                    {/* Booking Info */}
                    <div className="p-3 bg-gray-50 rounded-lg mb-5">
                      <p className="font-semibold text-gray-900">{selectedBooking.facility.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(selectedBooking.date)} • {selectedBooking.startTime} - {selectedBooking.endTime}
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        Mức độ hài lòng của bạn
                      </label>
                      <div className="flex justify-center">
                        {renderStars(rating, true, setRating)}
                      </div>
                      <p className="text-center text-sm text-gray-500 mt-2">
                        {rating === 1 && 'Rất không hài lòng'}
                        {rating === 2 && 'Không hài lòng'}
                        {rating === 3 && 'Bình thường'}
                        {rating === 4 && 'Hài lòng'}
                        {rating === 5 && 'Rất hài lòng'}
                      </p>
                    </div>

                    {/* Comment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        <MessageSquare className="w-4 h-4 inline mr-1" />
                        Nhận xét của bạn
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Chia sẻ trải nghiệm của bạn về cơ sở vật chất, dịch vụ..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                      />
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-6 py-4 bg-gray-50 flex gap-3">
                    <button
                      onClick={() => setShowFeedbackModal(false)}
                      disabled={submittingFeedback}
                      className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={submittingFeedback}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submittingFeedback ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Gửi đánh giá
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                // Success State
                <div className="p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Cảm ơn bạn!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Đánh giá của bạn đã được ghi nhận. Phản hồi của bạn giúp chúng tôi cải thiện dịch vụ.
                  </p>
                  <div className="flex justify-center mb-4">
                    {renderStars(rating)}
                  </div>
                  <button
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                  >
                    Đóng
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
