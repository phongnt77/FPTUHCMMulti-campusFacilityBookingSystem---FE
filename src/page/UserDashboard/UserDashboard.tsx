import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_FACILITIES } from '../../data/mockData';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [selectedCampus, setSelectedCampus] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Lấy danh sách phòng đang trống
  const availableNow = MOCK_FACILITIES.filter(
    (facility) => facility.status === 'Available'
  ).slice(0, 5);

  const handleFacilityClick = (facilityId: number) => {
    navigate(`/facilities/${facilityId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Thanh tìm kiếm nhanh */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8 text-center">
            Đặt phòng học và cơ sở vật chất
          </h1>
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Dropdown Campus */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn Campus
                </label>
                <select
                  value={selectedCampus}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCampus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Tất cả Campus</option>
                  <option value="Campus 1 (NVH)">Campus 1 (NVH)</option>
                  <option value="Campus 2 (Q9)">Campus 2 (Q9)</option>
                </select>
              </div>

              {/* Dropdown Ngày */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn Ngày
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Dropdown Giờ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn Giờ
                </label>
                <select
                  value={selectedTime}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Tất cả giờ</option>
                  <option value="08:00">08:00</option>
                  <option value="10:00">10:00</option>
                  <option value="12:00">12:00</option>
                  <option value="14:00">14:00</option>
                  <option value="16:00">16:00</option>
                  <option value="18:00">18:00</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => navigate('/facilities')}
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Available Now Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Có thể đặt ngay
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {availableNow.map((facility) => (
            <div
              key={facility.id}
              onClick={() => handleFacilityClick(facility.id)}
              className="min-w-[280px] bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
            >
              <img
                src={facility.image}
                alt={facility.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-800 mb-2">
                  {facility.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span>{facility.campus}</span>
                  <span>•</span>
                  <span>{facility.capacity} người</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {facility.utilities?.includes('Máy chiếu') && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      Có máy chiếu
                    </span>
                  )}
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                    Trống
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {facility.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

