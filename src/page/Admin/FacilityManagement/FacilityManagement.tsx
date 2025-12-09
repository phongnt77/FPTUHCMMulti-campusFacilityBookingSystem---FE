import { useState, useMemo } from 'react'
import { Plus, Search, Edit2, Trash2, Building2, Filter, X } from 'lucide-react'
import { mockFacilities } from '../../../data/adminMockData'
import type { Facility, FacilityType, Campus } from '../../../types'
import FacilityForm from './components/FacilityForm'

const FacilityManagement = () => {
  const [facilities, setFacilities] = useState<Facility[]>(mockFacilities)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<FacilityType | 'All'>('All')
  const [campusFilter, setCampusFilter] = useState<Campus | 'All'>('All')
  const [statusFilter, setStatusFilter] = useState<'Active' | 'Inactive' | 'All'>('All')
  const [showForm, setShowForm] = useState(false)
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filteredFacilities = useMemo(() => {
    return facilities.filter((facility) => {
      const matchesSearch =
        facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = typeFilter === 'All' || facility.type === typeFilter
      const matchesCampus = campusFilter === 'All' || facility.campus === campusFilter
      const matchesStatus = statusFilter === 'All' || (statusFilter === 'Active' ? facility.isActive : !facility.isActive)

      return matchesSearch && matchesType && matchesCampus && matchesStatus
    })
  }, [facilities, searchTerm, typeFilter, campusFilter, statusFilter])

  const handleSave = (facilityData: Partial<Facility>) => {
    if (editingFacility) {
      setFacilities(
        facilities.map((f) => (f.id === editingFacility.id ? { ...f, ...facilityData } : f))
      )
    } else {
      const newFacility: Facility = {
        id: `f${facilities.length + 1}`,
        ...facilityData,
        isActive: facilityData.isActive ?? true
      } as Facility
      setFacilities([...facilities, newFacility])
    }
    setShowForm(false)
    setEditingFacility(null)
  }

  const handleEdit = (facility: Facility) => {
    setEditingFacility(facility)
    setShowForm(true)
  }

  const handleDelete = (facilityId: string) => {
    setFacilities(facilities.filter((f) => f.id !== facilityId))
    setDeleteConfirm(null)
  }

  const getTypeBadgeColor = (type: FacilityType) => {
    switch (type) {
      case 'meeting-room':
        return 'bg-purple-100 text-purple-700'
      case 'lab-room':
        return 'bg-blue-100 text-blue-700'
      case 'sports-field':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const stats = useMemo(() => {
    return {
      total: facilities.length,
      active: facilities.filter((f) => f.isActive).length,
      byType: {
        'meeting-room': facilities.filter((f) => f.type === 'meeting-room').length,
        'lab-room': facilities.filter((f) => f.type === 'lab-room').length,
        'sports-field': facilities.filter((f) => f.type === 'sports-field').length
      },
      byCampus: {
        HCM: facilities.filter((f) => f.campus === 'HCM').length,
        NVH: facilities.filter((f) => f.campus === 'NVH').length
      }
    }
  }, [facilities])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Quản lý cơ sở vật chất</h1>
            <p className="text-gray-600">Quản lý tất cả cơ sở vật chất trên các campus</p>
          </div>
          <button
            onClick={() => {
              setEditingFacility(null)
              setShowForm(true)
            }}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Thêm cơ sở vật chất
          </button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-5">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 className="h-4 w-4" />
              <span>Tổng số</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-600">Đang hoạt động</div>
            <p className="mt-1 text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-600">HCM</div>
            <p className="mt-1 text-2xl font-bold text-orange-600">{stats.byCampus.HCM}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-600">NVH</div>
            <p className="mt-1 text-2xl font-bold text-purple-600">{stats.byCampus.NVH}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-600">Phòng họp</div>
            <p className="mt-1 text-2xl font-bold text-purple-600">{stats.byType['meeting-room']}</p>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm cơ sở vật chất..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as FacilityType | 'All')}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1"
              >
                <option value="All">Tất cả loại</option>
                <option value="meeting-room">Phòng họp</option>
                <option value="lab-room">Phòng Lab</option>
                <option value="sports-field">Sân thể thao</option>
              </select>
            </div>

            <select
              value={campusFilter}
              onChange={(e) => setCampusFilter(e.target.value as Campus | 'All')}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1"
            >
              <option value="All">Tất cả campus</option>
              <option value="HCM">Campus HCM</option>
              <option value="NVH">Campus NVH</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'Active' | 'Inactive' | 'All')}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1"
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="Active">Đang hoạt động</option>
              <option value="Inactive">Ngừng hoạt động</option>
            </select>

            {(typeFilter !== 'All' || campusFilter !== 'All' || statusFilter !== 'All' || searchTerm) && (
              <button
                onClick={() => {
                  setTypeFilter('All')
                  setCampusFilter('All')
                  setStatusFilter('All')
                  setSearchTerm('')
                }}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFacilities.map((facility) => (
            <div
              key={facility.id}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{facility.name}</h3>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getTypeBadgeColor(facility.type)}`}
                    >
                      {facility.type.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">Campus {facility.campus}</p>
                </div>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    facility.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {facility.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                </span>
              </div>

              <div className="mb-3 space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-semibold">Vị trí:</span> {facility.location}
                </p>
                <p>
                  <span className="font-semibold">Sức chứa:</span> {facility.capacity} người
                </p>
                {facility.description && <p className="text-xs">{facility.description}</p>}
                {facility.amenities && facility.amenities.length > 0 && (
                  <div>
                    <p className="font-semibold">Tiện ích:</p>
                    <p className="text-xs">{facility.amenities.join(', ')}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(facility)}
                  className="flex-1 rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-100 transition-colors"
                >
                  <Edit2 className="mr-1 inline h-4 w-4" />
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => setDeleteConfirm(facility.id)}
                  className="flex-1 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="mr-1 inline h-4 w-4" />
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredFacilities.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Không tìm thấy cơ sở vật chất</h3>
            <p className="mt-2 text-sm text-gray-600">Thử điều chỉnh bộ lọc hoặc thêm cơ sở vật chất mới.</p>
          </div>
        )}

        {showForm && (
          <FacilityForm
            facility={editingFacility}
            onClose={() => {
              setShowForm(false)
              setEditingFacility(null)
            }}
            onSave={handleSave}
          />
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
              <p className="mb-6 text-sm text-gray-600">
                Bạn có chắc chắn muốn xóa cơ sở vật chất này? Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FacilityManagement
