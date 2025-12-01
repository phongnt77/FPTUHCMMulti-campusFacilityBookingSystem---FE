import { useState, useMemo } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import StatusBadge from '../../../components/common/StatusBadge';
import {
  currentUser,
  getBookingsByUserId,
  getFacilityById,
  getCampusById,
  getFacilityTypeById,
  BookingStatus,
  Booking
} from '../../../data/mockData';

type FilterStatus = 'all' | BookingStatus;

export default function BookingHistory() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  const userBookings = useMemo(() => {
    return getBookingsByUserId(currentUser.id);
  }, []);

  const filteredBookings = useMemo(() => {
    return userBookings.filter(booking => {
      const facility = getFacilityById(booking.facilityId);
      const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
      const matchesSearch = searchQuery === '' || 
        booking.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility?.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [userBookings, filterStatus, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: userBookings.length,
      pending: userBookings.filter(b => b.status === 'pending').length,
      approved: userBookings.filter(b => b.status === 'approved').length,
      completed: userBookings.filter(b => b.status === 'completed').length,
      rejected: userBookings.filter(b => b.status === 'rejected').length,
      cancelled: userBookings.filter(b => b.status === 'cancelled').length
    };
  }, [userBookings]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      shortDate: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    };
  };

  const handleCancelBooking = (booking: Booking) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    // In real app, call API to cancel booking
    console.log('Cancelling booking:', bookingToCancel?.id);
    setShowCancelModal(false);
    setBookingToCancel(null);
  };

  const statusFilters: { key: FilterStatus; label: string; count: number }[] = [
    { key: 'all', label: 'Tất cả', count: stats.total },
    { key: 'pending', label: 'Chờ duyệt', count: stats.pending },
    { key: 'approved', label: 'Đã duyệt', count: stats.approved },
    { key: 'completed', label: 'Hoàn thành', count: stats.completed },
    { key: 'rejected', label: 'Từ chối', count: stats.rejected },
    { key: 'cancelled', label: 'Đã hủy', count: stats.cancelled }
  ];

  return (
    <MainLayout 
      user={currentUser} 
      title="Lịch sử đặt phòng"
      subtitle="Xem và quản lý các yêu cầu đặt phòng của bạn"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-500">Tổng cộng</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              <p className="text-xs text-slate-500">Chờ duyệt</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
              <p className="text-xs text-slate-500">Đã duyệt</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              <p className="text-xs text-slate-500">Hoàn thành</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-red-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              <p className="text-xs text-slate-500">Từ chối</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-500">{stats.cancelled}</p>
              <p className="text-xs text-slate-500">Đã hủy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div className="p-4 border-b border-slate-200">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Status Tabs */}
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setFilterStatus(filter.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filterStatus === filter.key
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter.label}
                  <span className={`ml-2 px-1.5 py-0.5 rounded-md text-xs ${
                    filterStatus === filter.key
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Tìm kiếm theo mục đích, phòng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="divide-y divide-slate-100">
          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">Không tìm thấy kết quả</h3>
              <p className="text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          ) : (
            filteredBookings.map((booking) => {
              const facility = getFacilityById(booking.facilityId);
              const campus = facility ? getCampusById(facility.campusId) : null;
              const facilityType = facility ? getFacilityTypeById(facility.typeId) : null;
              const startTime = formatDateTime(booking.startTime);
              const endTime = formatDateTime(booking.endTime);

              return (
                <div
                  key={booking.id}
                  className="p-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedBooking(booking)}
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Facility Image */}
                    <div className="w-full md:w-32 h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={facility?.imageUrl}
                        alt={facility?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <span>{facilityType?.icon}</span>
                            {facility?.name}
                          </h3>
                          <p className="text-sm text-slate-500">{campus?.name}</p>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>

                      <p className="text-sm text-slate-700 mb-3 line-clamp-1">
                        <span className="font-medium">Mục đích:</span> {booking.purpose}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{startTime.shortDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{startTime.time} - {endTime.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>{booking.attendeeCount} người</span>
                        </div>
                      </div>

                      {/* Reject Reason */}
                      {booking.status === 'rejected' && booking.rejectReason && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-lg">
                          <p className="text-sm text-red-700">
                            <span className="font-medium">Lý do từ chối:</span> {booking.rejectReason}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col gap-2 md:justify-start">
                      {(booking.status === 'pending' || booking.status === 'approved') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelBooking(booking);
                          }}
                          className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          Hủy đặt
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBooking(booking);
                        }}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Chi tiết đặt phòng</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {(() => {
                const facility = getFacilityById(selectedBooking.facilityId);
                const campus = facility ? getCampusById(facility.campusId) : null;
                const facilityType = facility ? getFacilityTypeById(facility.typeId) : null;
                const startTime = formatDateTime(selectedBooking.startTime);
                const endTime = formatDateTime(selectedBooking.endTime);
                const createdAt = formatDateTime(selectedBooking.createdAt);

                return (
                  <div className="space-y-6">
                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Mã đặt phòng: {selectedBooking.id}</span>
                      <StatusBadge status={selectedBooking.status} size="lg" />
                    </div>

                    {/* Facility Info */}
                    <div className="flex gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={facility?.imageUrl}
                          alt={facility?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                          <span>{facilityType?.icon}</span>
                          {facility?.name}
                        </h3>
                        <p className="text-sm text-slate-500 mb-2">{campus?.name}</p>
                        <div className="flex flex-wrap gap-2">
                          {facility?.equipment.map((item, idx) => (
                            <span key={idx} className="px-2 py-1 bg-white text-xs text-slate-600 rounded-lg border border-slate-200">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Ngày</p>
                        <p className="font-medium text-slate-900">{startTime.date}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Thời gian</p>
                        <p className="font-medium text-slate-900">{startTime.time} - {endTime.time}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Số người tham dự</p>
                        <p className="font-medium text-slate-900">{selectedBooking.attendeeCount} người</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Ngày tạo</p>
                        <p className="font-medium text-slate-900">{createdAt.date}</p>
                      </div>
                    </div>

                    {/* Purpose */}
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm text-slate-500 mb-1">Mục đích sử dụng</p>
                      <p className="font-medium text-slate-900">{selectedBooking.purpose}</p>
                    </div>

                    {/* Equipment Requests */}
                    {selectedBooking.equipmentRequests.length > 0 && (
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-2">Yêu cầu thiết bị</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedBooking.equipmentRequests.map((item, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-orange-100 text-orange-700 text-sm rounded-lg">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reject Reason */}
                    {selectedBooking.status === 'rejected' && selectedBooking.rejectReason && (
                      <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                        <p className="text-sm text-red-600 mb-1 font-medium">Lý do từ chối</p>
                        <p className="text-red-700">{selectedBooking.rejectReason}</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Đóng
              </button>
              {(selectedBooking.status === 'pending' || selectedBooking.status === 'approved') && (
                <button
                  onClick={() => {
                    handleCancelBooking(selectedBooking);
                    setSelectedBooking(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
                >
                  Hủy đặt phòng
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && bookingToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Xác nhận hủy đặt phòng</h3>
            <p className="text-slate-500 text-center mb-6">
              Bạn có chắc chắn muốn hủy đặt phòng này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setBookingToCancel(null);
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Không, giữ lại
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

