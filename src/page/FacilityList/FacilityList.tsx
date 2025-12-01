import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_FACILITIES } from '../../data/mockData';

export default function FacilityList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    campus1: false,
    campus2: false,
    over50: false,
    hasProjector: false,
    available: false,
  });

  // Lọc facilities dựa trên filter
  const filteredFacilities = MOCK_FACILITIES.filter((facility) => {
    if (filters.campus1 && facility.campus !== 'Campus 1 (NVH)') return false;
    if (filters.campus2 && facility.campus !== 'Campus 2 (Q9)') return false;
    if (filters.over50 && facility.capacity <= 50) return false;
    if (filters.hasProjector && !facility.utilities?.includes('Máy chiếu')) return false;
    if (filters.available && facility.status !== 'Available') return false;
    return true;
  });

  const handleFilterChange = (filterName: keyof typeof filters) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }));
  };

  const handleFacilityClick = (facilityId: number) => {
    navigate(`/facilities/${facilityId}`);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      Available: (
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">
          Trống
        </span>
      ),
      Busy: (
        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-medium">
          Đã đặt
        </span>
      ),
      Maintenance: (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded font-medium">
          Bảo trì
        </span>
      ),
    };
    return badges[status] || (
      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium">
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Danh sách phòng học và cơ sở vật chất
        </h1>

        <div className="flex gap-8">
          {/* Sidebar Filter */}
          <aside className="w-64 bg-white rounded-lg shadow-md p-6 h-fit sticky top-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Bộ lọc
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.campus1}
                  onChange={() => handleFilterChange('campus1')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Campus 1 (NVH)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.campus2}
                  onChange={() => handleFilterChange('campus2')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Campus 2 (Q9)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.over50}
                  onChange={() => handleFilterChange('over50')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">&gt;50 người</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasProjector}
                  onChange={() => handleFilterChange('hasProjector')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Có máy chiếu</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.available}
                  onChange={() => handleFilterChange('available')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Chỉ phòng trống</span>
              </label>
            </div>
          </aside>

          {/* Grid Layout */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFacilities.map((facility) => (
                <div
                  key={facility.id}
                  onClick={() => handleFacilityClick(facility.id)}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
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
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{facility.campus}</span>
                        <span>•</span>
                        <span>{facility.capacity} người</span>
                      </div>
                      {getStatusBadge(facility.status)}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {facility.utilities?.slice(0, 2).map((utility, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                        >
                          {utility}
                        </span>
                      ))}
                      {facility.utilities && facility.utilities.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{facility.utilities.length - 2} khác
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {facility.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredFacilities.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Không tìm thấy phòng nào phù hợp với bộ lọc
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

