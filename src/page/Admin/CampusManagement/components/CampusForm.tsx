import { Building2, MapPin, Phone, Mail, X, Loader2 } from 'lucide-react'
import type { Campus, CampusRequest } from '../api/campusApi'

interface CampusFormProps {
  campus: Campus | null
  onClose: () => void
  onSave: (campusData: CampusRequest) => Promise<void>
  loading?: boolean
}

const CampusForm = ({ campus, onClose, onSave, loading = false }: CampusFormProps) => {
  const isEdit = campus !== null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const campusData: CampusRequest = {
      name: formData.get('name')?.toString() || '',
      address: formData.get('address')?.toString() || '',
      phoneNumber: formData.get('phoneNumber')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      status: (formData.get('status')?.toString() || 'Active') as 'Active' | 'Inactive',
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(campusData.email)) {
      alert('Email không hợp lệ. Vui lòng nhập email đúng định dạng.')
      return
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[0-9+\-\s()]+$/
    if (!phoneRegex.test(campusData.phoneNumber)) {
      alert('Số điện thoại không hợp lệ. Vui lòng chỉ nhập số và các ký tự +, -, (, ).')
      return
    }

    try {
      await onSave(campusData)
    } catch (error) {
      // Error đã được xử lý trong parent component
      console.error('Error saving campus:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Chỉnh sửa campus' : 'Thêm campus mới'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                <Building2 className="mr-1 inline h-4 w-4" />
                Tên campus <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                defaultValue={campus?.name || ''}
                required
                disabled={loading}
                placeholder="VD: Campus Hồ Chí Minh"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                <MapPin className="mr-1 inline h-4 w-4" />
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                defaultValue={campus?.address || ''}
                required
                disabled={loading}
                rows={3}
                placeholder="VD: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  <Phone className="mr-1 inline h-4 w-4" />
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  defaultValue={campus?.phoneNumber || ''}
                  required
                  disabled={loading}
                  placeholder="VD: 028 7300 1866"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  <Mail className="mr-1 inline h-4 w-4" />
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={campus?.email || ''}
                  required
                  disabled={loading}
                  placeholder="VD: contact@fpt.edu.vn"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Trạng thái <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                defaultValue={campus?.status || 'Active'}
                required
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Active: Campus đang hoạt động | Inactive: Campus đã bị vô hiệu hóa
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CampusForm

