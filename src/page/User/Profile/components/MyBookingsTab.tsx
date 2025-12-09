import { useState, useEffect } from 'react';
import { getMyBookings, type MyBooking, type GetMyBookingsParams } from '../api/myBookingsApi';
import { Loader2, Calendar, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const MyBookingsTab = () => {
  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState<GetMyBookingsParams['status'] | ''>('');
  const limit = 10;

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: GetMyBookingsParams = {
        page: currentPage,
        limit: limit,
      };

      if (statusFilter) {
        params.status = statusFilter as GetMyBookingsParams['status'];
      }

      const response = await getMyBookings(params);

      if (response.success && response.data) {
        setBookings(response.data);
        
        if (response.pagination) {
          setTotalItems(response.pagination.total);
          setTotalPages(Math.ceil(response.pagination.total / response.pagination.limit));
        }
      } else {
        setError(response.error?.message || 'Không thể tải danh sách bookings');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentPage, statusFilter]);

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as GetMyBookingsParams['status'] | '');
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const getStatusBadge = (status: MyBooking['status']) => {
    const statusConfig: Record<MyBooking['status'], { label: string; className: string; icon: React.ReactNode }> = {
      Draft: {
        label: 'Đang soạn thảo',
        className: 'bg-gray-100 text-gray-700',
        icon: <AlertCircle className="w-3 h-3" />,
      },
      Pending_Approval: {
        label: 'Chờ duyệt',
        className: 'bg-yellow-100 text-yellow-700',
        icon: <Clock className="w-3 h-3" />,
      },
      Approved: {
        label: 'Đã duyệt',
        className: 'bg-green-100 text-green-700',
        icon: <CheckCircle className="w-3 h-3" />,
      },
      Rejected: {
        label: 'Bị từ chối',
        className: 'bg-red-100 text-red-700',
        icon: <XCircle className="w-3 h-3" />,
      },
      Cancelled: {
        label: 'Đã hủy',
        className: 'bg-gray-100 text-gray-700',
        icon: <XCircle className="w-3 h-3" />,
      },
      Completed: {
        label: 'Đã hoàn thành',
        className: 'bg-blue-100 text-blue-700',
        icon: <CheckCircle className="w-3 h-3" />,
      },
      No_Show: {
        label: 'Không đến',
        className: 'bg-orange-100 text-orange-700',
        icon: <AlertCircle className="w-3 h-3" />,
      },
    };

    const config = statusConfig[status] || statusConfig.Draft;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lọc theo trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            >
              <option value="">Tất cả</option>
              <option value="Draft">Đang soạn thảo</option>
              <option value="Pending_Approval">Chờ duyệt</option>
              <option value="Approved">Đã duyệt</option>
              <option value="Rejected">Bị từ chối</option>
              <option value="Cancelled">Đã hủy</option>
              <option value="Completed">Đã hoàn thành</option>
              <option value="No_Show">Không đến</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Bookings List */}
      {!isLoading && !error && bookings.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Bạn chưa có booking nào</p>
        </div>
      )}

      {!isLoading && !error && bookings.length > 0 && (
        <>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.bookingId}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {booking.facilityName}
                        </h3>
                        <p className="text-sm text-gray-600">{booking.purpose}</p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        <span>
                          <strong>Ngày:</strong> {formatDate(booking.startTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span>
                          <strong>Thời gian:</strong> {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
                        </span>
                      </div>
                      {booking.category && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          <span>
                            <strong>Loại:</strong> {booking.category}
                          </span>
                        </div>
                      )}
                      {booking.estimatedAttendees > 0 && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>
                            <strong>Số người tham dự:</strong> {booking.estimatedAttendees}
                          </span>
                        </div>
                      )}
                    </div>

                    {booking.specialRequirements && (
                      <div className="text-sm text-gray-600">
                        <strong>Yêu cầu đặc biệt:</strong> {booking.specialRequirements}
                      </div>
                    )}

                    {booking.rejectionReason && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">
                          <strong>Lý do từ chối:</strong> {booking.rejectionReason}
                        </p>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                      Tạo lúc: {formatDateTime(booking.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="text-sm text-gray-600">
                Hiển thị {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, totalItems)} trong tổng số {totalItems} bookings
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Trước
                </button>
                <span className="px-3 py-1.5 text-sm font-medium text-gray-700">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyBookingsTab;

