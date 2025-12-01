import { Link } from 'react-router-dom';
import MainLayout from '../../../components/layout/MainLayout';
import {
  currentUser,
  getBookingsByUserId,
  getFacilityById,
  getFacilityTypeById,
  campuses,
  facilityTypes
} from '../../../data/mockData';

export default function Dashboard() {
  const userBookings = getBookingsByUserId(currentUser.id);
  const pendingBookings = userBookings.filter(b => b.status === 'pending');
  const upcomingBookings = userBookings.filter(b => b.status === 'approved');

  return (
    <MainLayout 
      user={currentUser} 
      title="Dashboard"
      subtitle={`Xin chào, ${currentUser.name}!`}
    >
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Chào mừng đến với FPT Booking</h2>
          <p className="text-white/80 text-lg mb-6">Đặt phòng họp, phòng lab và sân thể thao dễ dàng trong vài bước</p>
          <Link
            to="/booking"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Đặt phòng ngay
          </Link>
        </div>
        <div className="absolute right-8 bottom-0 opacity-20">
          <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {pendingBookings.length > 0 && (
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                Đang chờ
              </span>
            )}
          </div>
          <p className="text-4xl font-bold text-slate-900 mb-1">{pendingBookings.length}</p>
          <p className="text-slate-500">Yêu cầu chờ duyệt</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-slate-900 mb-1">{upcomingBookings.length}</p>
          <p className="text-slate-500">Lịch đặt sắp tới</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-slate-900 mb-1">{userBookings.length}</p>
          <p className="text-slate-500">Tổng lượt đặt</p>
        </div>
      </div>

      {/* Campus & Facility Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Campus Selection */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Chọn Campus</h3>
          <div className="space-y-3">
            {campuses.map((campus) => (
              <Link
                key={campus.id}
                to={`/booking?campus=${campus.id}`}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">
                    {campus.code}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{campus.name}</p>
                    <p className="text-sm text-slate-500 line-clamp-1">{campus.address}</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>

        {/* Facility Types */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Loại cơ sở vật chất</h3>
          <div className="grid grid-cols-2 gap-3">
            {facilityTypes.map((type) => (
              <Link
                key={type.id}
                to={`/booking?type=${type.id}`}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all group"
              >
                <span className="text-2xl">{type.icon}</span>
                <span className="font-medium text-slate-700 group-hover:text-slate-900">{type.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Lịch đặt sắp tới</h3>
            <p className="text-sm text-slate-500">Các phòng/sân bạn đã đặt thành công</p>
          </div>
          <Link
            to="/my-bookings"
            className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            Xem tất cả
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        {upcomingBookings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-slate-900 mb-1">Chưa có lịch đặt</h4>
            <p className="text-slate-500 mb-4">Bạn chưa có phòng/sân nào được duyệt</p>
            <Link
              to="/booking"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Đặt phòng ngay
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {upcomingBookings.slice(0, 3).map((booking) => {
              const facility = getFacilityById(booking.facilityId);
              const facilityType = facility ? getFacilityTypeById(facility.typeId) : null;
              const startTime = new Date(booking.startTime);
              const endTime = new Date(booking.endTime);

              return (
                <div key={booking.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={facility?.imageUrl}
                        alt={facility?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                        <span>{facilityType?.icon}</span>
                        {facility?.name}
                      </h4>
                      <p className="text-sm text-slate-500">{booking.purpose}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-900">
                        {startTime.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                      </p>
                      <p className="text-sm text-slate-500">
                        {startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
