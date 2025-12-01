import { useParams, useNavigate } from 'react-router-dom';
import { getFacilityById, getTimeSlotsByFacility } from '../../../data/mockData';

export default function FacilityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const facility = id ? getFacilityById(id) : null;

  if (!facility) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy cơ sở vật chất</h2>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const todaySlots = getTimeSlotsByFacility(facility.id, new Date().toISOString().split('T')[0]);
  const availableToday = todaySlots.filter(slot => slot.status === 'available').length;

  const getStatusBadge = (status: string) => {
    const statusMap = {
      available: { text: 'Có sẵn', class: 'bg-green-100 text-green-800' },
      maintenance: { text: 'Bảo trì', class: 'bg-yellow-100 text-yellow-800' },
      closed: { text: 'Đóng cửa', class: 'bg-red-100 text-red-800' }
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.available;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{facility.name}</h1>
              <div className="mt-2 flex items-center gap-4">
                <span className="text-gray-600">{facility.type}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{facility.campus}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{facility.location}</span>
              </div>
            </div>
            {getStatusBadge(facility.status)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-video bg-gray-200 flex items-center justify-center">
                {facility.images[0] ? (
                  <img src={facility.images[0]} alt={facility.name} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Mô tả</h2>
              <p className="text-gray-700 leading-relaxed">{facility.description}</p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tiện ích</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {facility.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>

            {/* Operating Hours */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Giờ hoạt động</h2>
              <div className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{facility.operatingHours.open} - {facility.operatingHours.close}</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin nhanh</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Sức chứa</div>
                  <div className="text-lg font-semibold text-gray-900">{facility.capacity} người</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Slot có sẵn hôm nay</div>
                  <div className="text-lg font-semibold text-green-600">{availableToday} slot</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <button
                onClick={() => navigate(`/calendar/${facility.id}`)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-3"
              >
                Xem lịch & Đặt phòng
              </button>
              <button
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Yêu thích
              </button>
            </div>

            {/* Today's Availability Preview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Lịch hôm nay</h2>
              <div className="space-y-2">
                {todaySlots.slice(0, 5).map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-2 rounded border">
                    <span className="text-sm text-gray-700">
                      {slot.startTime} - {slot.endTime}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      slot.status === 'available' ? 'bg-green-100 text-green-800' :
                      slot.status === 'booked' ? 'bg-red-100 text-red-800' :
                      slot.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {slot.status === 'available' ? 'Trống' :
                       slot.status === 'booked' ? 'Đã đặt' :
                       slot.status === 'pending' ? 'Chờ duyệt' : 'Bảo trì'}
                    </span>
                  </div>
                ))}
                {todaySlots.length > 5 && (
                  <button
                    onClick={() => navigate(`/calendar/${facility.id}`)}
                    className="w-full text-blue-600 text-sm font-medium hover:text-blue-700 mt-2"
                  >
                    Xem tất cả ({todaySlots.length} slot)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

