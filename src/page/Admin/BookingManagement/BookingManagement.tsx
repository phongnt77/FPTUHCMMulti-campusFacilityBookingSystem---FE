import { useState, useMemo } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import StatusBadge from '../../../components/common/StatusBadge';
import {
  adminUser,
  bookings,
  getFacilityById,
  getCampusById,
  getFacilityTypeById,
  getUserById,
  campuses,
  facilityTypes,
  BookingStatus,
  Booking
} from '../../../data/mockData';

type FilterStatus = 'all' | BookingStatus;

const rejectReasons = [
  'Trùng lịch với hoạt động ưu tiên',
  'Phòng đang bảo trì đột xuất',
  'Mục đích sử dụng không phù hợp',
  'Vượt quá thời gian cho phép',
  'Người dùng đang bị hạn chế',
  'Khác (ghi rõ)'
];

export default function BookingManagement() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterCampus, setFilterCampus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRejectReason, setSelectedRejectReason] = useState('');
  const [customRejectReason, setCustomRejectReason] = useState('');
  const [bookingDetail, setBookingDetail] = useState<Booking | null>(null);

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const facility = getFacilityById(booking.facilityId);
      const user = getUserById(booking.userId);
      
      const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
      const matchesCampus = filterCampus === 'all' || facility?.campusId === filterCampus;
      const matchesType = filterType === 'all' || facility?.typeId === filterType;
      const matchesSearch = searchQuery === '' || 
        booking.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user?.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStatus && matchesCampus && matchesType && matchesSearch;
    });
  }, [filterStatus, filterCampus, filterType, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      approved: bookings.filter(b => b.status === 'approved').length,
      rejected: bookings.filter(b => b.status === 'rejected').length,
      completed: bookings.filter(b => b.status === 'completed').length
    };
  }, []);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
    };
  };

  const toggleSelectBooking = (bookingId: string) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const toggleSelectAll = () => {
    const pendingBookings = filteredBookings.filter(b => b.status === 'pending');
    if (selectedBookings.length === pendingBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(pendingBookings.map(b => b.id));
    }
  };

  const handleBatchApprove = () => {
    setShowApproveModal(true);
  };

  const handleBatchReject = () => {
    setShowRejectModal(true);
  };

  const confirmApprove = () => {
    // In real app, call API to approve bookings
    console.log('Approving bookings:', selectedBookings);
    setShowApproveModal(false);
    setSelectedBookings([]);
  };

  const confirmReject = () => {
    const reason = selectedRejectReason === 'Khác (ghi rõ)' ? customRejectReason : selectedRejectReason;
    // In real app, call API to reject bookings
    console.log('Rejecting bookings:', selectedBookings, 'Reason:', reason);
    setShowRejectModal(false);
    setSelectedBookings([]);
    setSelectedRejectReason('');
    setCustomRejectReason('');
  };

  const handleQuickApprove = (booking: Booking) => {
    setSelectedBookings([booking.id]);
    setShowApproveModal(true);
  };

  const handleQuickReject = (booking: Booking) => {
    setSelectedBookings([booking.id]);
    setShowRejectModal(true);
  };

  const pendingBookingsCount = filteredBookings.filter(b => b.status === 'pending').length;

  return (
    <MainLayout 
      user={adminUser} 
      title="Quản lý đặt phòng"
      subtitle="Duyệt và quản lý các yêu cầu đặt phòng từ người dùng"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
          <p className="text-sm text-slate-500">Tổng yêu cầu</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {stats.pending > 0 && (
              <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg animate-pulse">
                Cần xử lý
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-sm text-amber-700">Chờ duyệt</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-600">{stats.approved}</p>
          <p className="text-sm text-slate-500">Đã duyệt</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-red-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
          <p className="text-sm text-slate-500">Từ chối</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.completed}</p>
          <p className="text-sm text-slate-500">Hoàn thành</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'pending', label: 'Chờ duyệt' },
              { key: 'approved', label: 'Đã duyệt' },
              { key: 'rejected', label: 'Từ chối' },
              { key: 'completed', label: 'Hoàn thành' },
              { key: 'cancelled', label: 'Đã hủy' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFilterStatus(filter.key as FilterStatus)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filterStatus === filter.key
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Other Filters */}
          <div className="flex flex-wrap gap-3 lg:ml-auto">
            {/* Campus Filter */}
            <select
              value={filterCampus}
              onChange={(e) => setFilterCampus(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              <option value="all">Tất cả Campus</option>
              {campuses.map((campus) => (
                <option key={campus.id} value={campus.id}>{campus.code}</option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              <option value="all">Tất cả loại</option>
              {facilityTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
              ))}
            </select>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
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
      </div>

      {/* Batch Actions */}
      {selectedBookings.length > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-lg shadow-orange-500/25">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="font-bold">{selectedBookings.length}</span>
            </div>
            <span className="font-medium">yêu cầu đã chọn</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedBookings([])}
              className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              Bỏ chọn
            </button>
            <button
              onClick={handleBatchReject}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
            >
              Từ chối tất cả
            </button>
            <button
              onClick={handleBatchApprove}
              className="px-4 py-2 text-sm font-medium text-orange-600 bg-white hover:bg-orange-50 rounded-xl transition-colors"
            >
              Duyệt tất cả
            </button>
          </div>
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Danh sách yêu cầu ({filteredBookings.length})</h3>
            {pendingBookingsCount > 0 && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedBookings.length === pendingBookingsCount && pendingBookingsCount > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-slate-600">Chọn tất cả đang chờ</span>
              </label>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="w-12 px-4 py-3"></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Người đặt</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Phòng/Sân</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Thời gian</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mục đích</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-1">Không tìm thấy yêu cầu</h3>
                    <p className="text-slate-500">Thử thay đổi bộ lọc để xem các yêu cầu khác</p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => {
                  const facility = getFacilityById(booking.facilityId);
                  const campus = facility ? getCampusById(facility.campusId) : null;
                  const facilityType = facility ? getFacilityTypeById(facility.typeId) : null;
                  const user = getUserById(booking.userId);
                  const startTime = formatDateTime(booking.startTime);
                  const endTime = formatDateTime(booking.endTime);
                  const isSelected = selectedBookings.includes(booking.id);

                  return (
                    <tr 
                      key={booking.id} 
                      className={`hover:bg-slate-50/50 transition-colors ${isSelected ? 'bg-orange-50/50' : ''}`}
                    >
                      <td className="px-4 py-4">
                        {booking.status === 'pending' && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectBooking(booking.id)}
                            className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                          />
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                            {user?.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{user?.name}</p>
                            <p className="text-xs text-slate-500">{user?.email}</p>
                            {user?.isBanned && (
                              <span className="inline-flex items-center px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded mt-1">
                                ⚠️ Bị hạn chế
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{facilityType?.icon}</span>
                          <div>
                            <p className="font-medium text-slate-900">{facility?.name}</p>
                            <p className="text-xs text-slate-500">{campus?.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-900">{startTime.date}</p>
                        <p className="text-sm text-slate-500">{startTime.time} - {endTime.time}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-700 max-w-xs truncate" title={booking.purpose}>
                          {booking.purpose}
                        </p>
                        <p className="text-xs text-slate-500">{booking.attendeeCount} người</p>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={booking.status} size="sm" />
                        {booking.rejectReason && (
                          <p className="text-xs text-red-500 mt-1 max-w-xs truncate" title={booking.rejectReason}>
                            {booking.rejectReason}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setBookingDetail(booking)}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleQuickApprove(booking)}
                                className="p-2 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Duyệt"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleQuickReject(booking)}
                                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Từ chối"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {bookingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Chi tiết yêu cầu đặt phòng</h2>
                <p className="text-sm text-slate-500">Mã: {bookingDetail.id}</p>
              </div>
              <button
                onClick={() => setBookingDetail(null)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {(() => {
                const facility = getFacilityById(bookingDetail.facilityId);
                const campus = facility ? getCampusById(facility.campusId) : null;
                const facilityType = facility ? getFacilityTypeById(facility.typeId) : null;
                const user = getUserById(bookingDetail.userId);
                const startTime = formatDateTime(bookingDetail.startTime);
                const endTime = formatDateTime(bookingDetail.endTime);
                const createdAt = formatDateTime(bookingDetail.createdAt);

                return (
                  <div className="space-y-6">
                    {/* Status */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <span className="text-sm font-medium text-slate-600">Trạng thái hiện tại</span>
                      <StatusBadge status={bookingDetail.status} size="lg" />
                    </div>

                    {/* User Info */}
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Thông tin người đặt</h4>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xl">
                          {user?.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-lg">{user?.name}</p>
                          <p className="text-slate-500">{user?.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-lg font-medium">
                              {user?.role === 'student' ? 'Sinh viên' : user?.role === 'lecturer' ? 'Giảng viên' : 'Admin'}
                            </span>
                            <span className="text-xs text-slate-500">{user?.department}</span>
                            {user?.isBanned && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-lg font-medium">
                                ⚠️ Bị hạn chế: {user.banReason}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Facility Info */}
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Thông tin phòng/sân</h4>
                      <div className="flex gap-4">
                        <div className="w-32 h-24 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={facility?.imageUrl}
                            alt={facility?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-lg">
                            <span>{facilityType?.icon}</span>
                            {facility?.name}
                          </h3>
                          <p className="text-slate-500 mb-2">{campus?.name}</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-white text-xs text-slate-600 rounded-lg border border-slate-200">
                              👥 Sức chứa: {facility?.capacity} người
                            </span>
                            {facility?.equipment.map((item, idx) => (
                              <span key={idx} className="px-2 py-1 bg-white text-xs text-slate-600 rounded-lg border border-slate-200">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Ngày sử dụng</p>
                        <p className="font-semibold text-slate-900">{startTime.full}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Thời gian</p>
                        <p className="font-semibold text-slate-900">{startTime.time} - {endTime.time}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Số người tham dự</p>
                        <p className="font-semibold text-slate-900">{bookingDetail.attendeeCount} người</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Ngày tạo yêu cầu</p>
                        <p className="font-semibold text-slate-900">{createdAt.date} {createdAt.time}</p>
                      </div>
                    </div>

                    {/* Purpose */}
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm text-slate-500 mb-2">Mục đích sử dụng</p>
                      <p className="font-medium text-slate-900 text-lg">{bookingDetail.purpose}</p>
                    </div>

                    {/* Equipment Requests */}
                    {bookingDetail.equipmentRequests.length > 0 && (
                      <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                        <p className="text-sm text-orange-700 font-medium mb-2">Yêu cầu thiết bị đặc biệt</p>
                        <div className="flex flex-wrap gap-2">
                          {bookingDetail.equipmentRequests.map((item, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-orange-100 text-orange-700 text-sm rounded-lg font-medium">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reject Reason */}
                    {bookingDetail.status === 'rejected' && bookingDetail.rejectReason && (
                      <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                        <p className="text-sm text-red-600 mb-1 font-medium">Lý do từ chối</p>
                        <p className="text-red-700">{bookingDetail.rejectReason}</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setBookingDetail(null)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors"
              >
                Đóng
              </button>
              {bookingDetail.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleQuickReject(bookingDetail);
                      setBookingDetail(null);
                    }}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
                  >
                    Từ chối
                  </button>
                  <button
                    onClick={() => {
                      handleQuickApprove(bookingDetail);
                      setBookingDetail(null);
                    }}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors"
                  >
                    Duyệt yêu cầu
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Xác nhận duyệt yêu cầu</h3>
            <p className="text-slate-500 text-center mb-6">
              Bạn sắp duyệt <span className="font-semibold text-slate-700">{selectedBookings.length}</span> yêu cầu đặt phòng. 
              Hệ thống sẽ gửi thông báo và mã QR check-in đến người dùng.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedBookings([]);
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmApprove}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors"
              >
                Xác nhận duyệt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Từ chối yêu cầu</h3>
            <p className="text-slate-500 text-center mb-6">
              Bạn sắp từ chối <span className="font-semibold text-slate-700">{selectedBookings.length}</span> yêu cầu. 
              Vui lòng chọn lý do từ chối.
            </p>
            
            <div className="space-y-3 mb-6">
              {rejectReasons.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedRejectReason === reason
                      ? 'border-red-500 bg-red-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    value={reason}
                    checked={selectedRejectReason === reason}
                    onChange={(e) => setSelectedRejectReason(e.target.value)}
                    className="w-4 h-4 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm text-slate-700">{reason}</span>
                </label>
              ))}
              
              {selectedRejectReason === 'Khác (ghi rõ)' && (
                <textarea
                  value={customRejectReason}
                  onChange={(e) => setCustomRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                  rows={3}
                />
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedBookings([]);
                  setSelectedRejectReason('');
                  setCustomRejectReason('');
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmReject}
                disabled={!selectedRejectReason || (selectedRejectReason === 'Khác (ghi rõ)' && !customRejectReason)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

