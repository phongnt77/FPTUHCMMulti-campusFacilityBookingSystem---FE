import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Facility, Campus, FacilityType } from '../../../types';
import { facilityApi } from './api/api';

interface FacilityFormData {
  name: string;
  type: FacilityType;
  campus: Campus;
  capacity: number;
  location: string;
  description: string;
  amenities: string;
  isActive: boolean;
}

const initialFormData: FacilityFormData = {
  name: '',
  type: 'meeting-room',
  campus: 'HCM',
  capacity: 10,
  location: '',
  description: '',
  amenities: '',
  isActive: true,
};

const FacilityManagement = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampus, setSelectedCampus] = useState<Campus | 'all'>('all');
  const [selectedType, setSelectedType] = useState<FacilityType | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [formData, setFormData] = useState<FacilityFormData>(initialFormData);

  useEffect(() => {
    loadFacilities();
  }, [selectedCampus, selectedType]);

  const loadFacilities = async () => {
    setLoading(true);
    try {
      const data = await facilityApi.getFacilities({
        campus: selectedCampus !== 'all' ? selectedCampus : undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
      });
      setFacilities(data);
    } catch (error) {
      console.error('Error loading facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (facility?: Facility) => {
    if (facility) {
      setEditingFacility(facility);
      setFormData({
        name: facility.name,
        type: facility.type,
        campus: facility.campus,
        capacity: facility.capacity,
        location: facility.location,
        description: facility.description || '',
        amenities: facility.amenities?.join(', ') || '',
        isActive: facility.isActive,
      });
    } else {
      setEditingFacility(null);
      setFormData(initialFormData);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFacility(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const facilityData = {
      name: formData.name,
      type: formData.type,
      campus: formData.campus,
      capacity: formData.capacity,
      location: formData.location,
      description: formData.description,
      amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a),
      isActive: formData.isActive,
    };

    try {
      if (editingFacility) {
        await facilityApi.updateFacility(editingFacility.id, facilityData);
      } else {
        await facilityApi.createFacility(facilityData);
      }
      handleCloseModal();
      await loadFacilities();
    } catch (error) {
      console.error('Error saving facility:', error);
      alert('Có lỗi xảy ra khi lưu cơ sở vật chất');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cơ sở vật chất này?')) {
      try {
        await facilityApi.deleteFacility(id);
        await loadFacilities();
      } catch (error) {
        console.error('Error deleting facility:', error);
        alert('Có lỗi xảy ra khi xóa cơ sở vật chất');
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await facilityApi.toggleFacilityStatus(id);
      await loadFacilities();
    } catch (error) {
      console.error('Error toggling facility status:', error);
    }
  };

  const getFacilityTypeLabel = (type: FacilityType) => {
    const labels = {
      'meeting-room': 'Phòng họp',
      'lab-room': 'Phòng lab',
      'sports-field': 'Sân thể thao',
    };
    return labels[type];
  };

  const getFacilityTypeIcon = (type: FacilityType) => {
    switch (type) {
      case 'meeting-room':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'lab-room':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'sports-field':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/admin/dashboard" className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý cơ sở vật chất</h1>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Thêm mới
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Campus</label>
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value as Campus | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả Campus</option>
                <option value="HCM">HCM Campus</option>
                <option value="NVH">NVH Campus</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại cơ sở</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as FacilityType | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả loại</option>
                <option value="meeting-room">Phòng họp</option>
                <option value="lab-room">Phòng lab</option>
                <option value="sports-field">Sân thể thao</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Tổng số</div>
            <div className="text-2xl font-bold text-gray-900">{facilities.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Phòng họp</div>
            <div className="text-2xl font-bold text-purple-600">
              {facilities.filter(f => f.type === 'meeting-room').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Phòng lab</div>
            <div className="text-2xl font-bold text-orange-600">
              {facilities.filter(f => f.type === 'lab-room').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Sân thể thao</div>
            <div className="text-2xl font-bold text-green-600">
              {facilities.filter(f => f.type === 'sports-field').length}
            </div>
          </div>
        </div>

        {/* Facilities Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-500">Đang tải...</div>
          </div>
        ) : facilities.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có cơ sở vật chất</h3>
            <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách thêm cơ sở vật chất mới.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((facility) => (
              <div key={facility.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`h-2 ${
                  facility.type === 'meeting-room' ? 'bg-purple-500' :
                  facility.type === 'lab-room' ? 'bg-orange-500' : 'bg-green-500'
                }`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        facility.type === 'meeting-room' ? 'bg-purple-100 text-purple-600' :
                        facility.type === 'lab-room' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {getFacilityTypeIcon(facility.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{facility.name}</h3>
                        <p className="text-sm text-gray-500">{getFacilityTypeLabel(facility.type)}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      facility.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {facility.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {facility.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      Sức chứa: {facility.capacity} người
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Campus: {facility.campus}
                    </div>
                  </div>

                  {facility.amenities && facility.amenities.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-1">
                        {facility.amenities.slice(0, 3).map((amenity, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            {amenity}
                          </span>
                        ))}
                        {facility.amenities.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            +{facility.amenities.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {facility.description && (
                    <p className="mt-3 text-sm text-gray-500 line-clamp-2">{facility.description}</p>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                    <button
                      onClick={() => handleToggleStatus(facility.id)}
                      className={`text-sm font-medium ${
                        facility.isActive ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'
                      }`}
                    >
                      {facility.isActive ? 'Tạm ngưng' : 'Kích hoạt'}
                    </button>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleOpenModal(facility)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(facility.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleCloseModal}></div>
            
            <div className="inline-block w-full max-w-lg my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingFacility ? 'Chỉnh sửa cơ sở vật chất' : 'Thêm cơ sở vật chất mới'}
                </h3>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="px-6 py-4 space-y-4 max-h-96 overflow-y-auto">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên cơ sở *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="VD: Phòng họp A1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Loại cơ sở *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as FacilityType })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="meeting-room">Phòng họp</option>
                        <option value="lab-room">Phòng lab</option>
                        <option value="sports-field">Sân thể thao</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Campus *</label>
                      <select
                        value={formData.campus}
                        onChange={(e) => setFormData({ ...formData, campus: e.target.value as Campus })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="HCM">HCM Campus</option>
                        <option value="NVH">NVH Campus</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí *</label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="VD: Tầng 3, Tòa A"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Mô tả chi tiết về cơ sở vật chất"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiện ích</label>
                    <input
                      type="text"
                      value={formData.amenities}
                      onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="VD: Projector, WiFi, AC (phân cách bằng dấu phẩy)"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Đang hoạt động
                    </label>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {editingFacility ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityManagement;

