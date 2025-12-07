import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Loader2, AlertCircle, Building2 } from 'lucide-react'
import type { Campus, CampusRequest, GetCampusesParams } from './api/campusApi'
import { getCampuses, createCampus, updateCampus, deleteCampus } from './api/campusApi'
import CampusForm from './components/CampusForm'
import Pagination from '../Facility Dashboard/components/Pagination'

const CampusManagement = () => {
  // State cho campuses và pagination
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State cho pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

  // State cho form và actions
  const [showForm, setShowForm] = useState(false)
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Fetch campuses từ API
  const fetchCampuses = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params: GetCampusesParams = {
        page: currentPage,
        limit: itemsPerPage,
      }

      const response = await getCampuses(params)

      if (response.success && response.data) {
        setCampuses(response.data)
        // Cập nhật total items từ pagination
        if (response.pagination) {
          setTotalItems(response.pagination.total)
        } else {
          setTotalItems(response.data.length)
        }
      } else {
        setError(response.error?.message || response.message || 'Không thể tải danh sách campuses')
        setCampuses([])
      }
    } catch (err) {
      console.error('Error fetching campuses:', err)
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải danh sách campuses'
      setError(errorMessage)
      setCampuses([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, itemsPerPage])

  // Fetch campuses khi component mount hoặc khi dependencies thay đổi
  useEffect(() => {
    fetchCampuses()
  }, [fetchCampuses])

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle save (create or update)
  const handleSave = async (campusData: CampusRequest) => {
    setFormLoading(true)

    try {
      if (editingCampus) {
        // Update campus
        await updateCampus(editingCampus.campusId, campusData, campusData.status)
      } else {
        // Create new campus
        await createCampus(campusData)
      }

      // Close form and refresh list
      setShowForm(false)
      setEditingCampus(null)
      await fetchCampuses()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu campus'
      alert(errorMessage)
      throw err // Re-throw để form có thể xử lý
    } finally {
      setFormLoading(false)
    }
  }

  // Handle edit
  const handleEdit = (campus: Campus) => {
    setEditingCampus(campus)
    setShowForm(true)
  }

  // Handle delete (soft delete - vô hiệu hóa)
  const handleDelete = async (campusId: string) => {
    setDeleteLoading(true)

    try {
      await deleteCampus(campusId)
      setDeleteConfirm(null)
      await fetchCampuses()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi vô hiệu hóa campus'
      alert(errorMessage)
    } finally {
      setDeleteLoading(false)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    return status === 'Active'
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-700'
  }

  // Tính toán total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Quản lý Campus</h1>
            <p className="text-gray-600">Quản lý tất cả các campus trong hệ thống</p>
          </div>
          <button
            onClick={() => {
              setEditingCampus(null)
              setShowForm(true)
            }}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Thêm Campus
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="mt-4 text-sm text-gray-600">Đang tải danh sách campuses...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="text-sm font-semibold text-red-800">Lỗi khi tải dữ liệu</h3>
                <p className="mt-1 text-sm text-red-600">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchCampuses}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && campuses.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Chưa có campus nào</h3>
            <p className="mt-2 text-sm text-gray-600">
              Bắt đầu bằng cách thêm campus đầu tiên vào hệ thống.
            </p>
            <button
              onClick={() => {
                setEditingCampus(null)
                setShowForm(true)
              }}
              className="mt-4 flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 transition-colors mx-auto"
            >
              <Plus className="h-5 w-5" />
              Thêm Campus
            </button>
          </div>
        )}

        {/* Campuses Table */}
        {!loading && !error && campuses.length > 0 && (
          <>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                        Tên Campus
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                        Địa chỉ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                        Liên hệ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {campuses.map((campus) => (
                      <tr key={campus.campusId} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center">
                            <Building2 className="mr-2 h-5 w-5 text-orange-500" />
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{campus.name}</div>
                              <div className="text-xs text-gray-500">ID: {campus.campusId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs text-sm text-gray-900">{campus.address}</div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm text-gray-900">{campus.phoneNumber}</div>
                          <div className="text-xs text-gray-500">{campus.email}</div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                              campus.status
                            )}`}
                          >
                            {campus.status === 'Active' ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {formatDate(campus.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(campus)}
                              className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(campus.campusId)}
                              disabled={campus.status === 'Inactive'}
                              className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title={campus.status === 'Inactive' ? 'Đã vô hiệu hóa' : 'Vô hiệu hóa'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Vô hiệu hóa Campus</h3>
                  <p className="text-sm text-gray-600">Bạn có chắc chắn muốn vô hiệu hóa campus này?</p>
                </div>
              </div>
              <p className="mb-6 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                <strong>Lưu ý:</strong> Đây là thao tác soft delete. Campus sẽ được đánh dấu là "Inactive" nhưng
                dữ liệu vẫn được giữ lại trong hệ thống.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleteLoading}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleteLoading}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Xác nhận vô hiệu hóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Campus Form Modal */}
        {showForm && (
          <CampusForm
            campus={editingCampus}
            onClose={() => {
              setShowForm(false)
              setEditingCampus(null)
            }}
            onSave={handleSave}
            loading={formLoading}
          />
        )}
      </div>
    </div>
  )
}

export default CampusManagement

