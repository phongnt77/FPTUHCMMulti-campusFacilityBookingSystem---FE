/**
 * CampusForm Component - Form tạo/chỉnh sửa Campus
 * 
 * Component này hiển thị modal form để:
 * - Tạo campus mới
 * - Chỉnh sửa campus hiện có
 * 
 * Tính năng:
 * - Validation email format
 * - Validation phone number format
 * - Auto-format phone number input (chỉ cho phép số và ký tự đặc biệt)
 * - Status selection (Active/Inactive)
 * - Loading state khi submit
 * 
 * Fields:
 * - name: Tên campus (required)
 * - address: Địa chỉ (required)
 * - phoneNumber: Số điện thoại (required)
 * - email: Email (required, validated)
 * - status: Trạng thái (Active/Inactive, required)
 */

// Import React hooks
import { useState, useEffect } from 'react'
// Import icons
import { Building2, MapPin, Phone, Mail, X, Loader2, Image as ImageIcon } from 'lucide-react'
// Import types
import type { Campus, CampusWithImageRequest } from '../api/campusApi'

/**
 * Interface định nghĩa props của CampusForm
 * 
 * @property {Campus | null} campus - Campus object nếu đang chỉnh sửa, null nếu tạo mới
 * @property {() => void} onClose - Callback khi đóng form
 * @property {(campusData: CampusRequest | CampusWithImageRequest) => Promise<void>} onSave - Callback khi submit form (async)
 * @property {boolean} loading - Trạng thái loading (optional, default: false)
 */
interface CampusFormProps {
  campus: Campus | null
  onClose: () => void
  onSave: (campusData: CampusWithImageRequest) => Promise<void>
  loading?: boolean
}

/**
 * CampusForm Component Function
 * 
 * Modal form component để tạo hoặc chỉnh sửa campus
 * 
 * @param {CampusFormProps} props - Props của component
 * @returns {JSX.Element} - JSX element chứa form modal
 */
const CampusForm = ({ campus, onClose, onSave, loading = false }: CampusFormProps) => {
  // Kiểm tra xem đang edit hay create
  // isEdit = true nếu campus không null (đang chỉnh sửa)
  // isEdit = false nếu campus null (đang tạo mới)
  const isEdit = campus !== null

  // State để lưu file ảnh đã chọn
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Reset image preview khi campus thay đổi (khi chuyển từ edit sang create hoặc ngược lại)
  useEffect(() => {
    setTimeout(() => {
      setSelectedImage(null)
      setImagePreview(null)
    }, 0)
  }, [campus])

  /**
   * Function: Handle khi user chọn file ảnh
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - File input change event
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file extension - chỉ chấp nhận: .jpg, .jpeg, .png, .gif, .webp
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
      const fileName = file.name.toLowerCase()
      const fileExtension = fileName.substring(fileName.lastIndexOf('.'))
      
      if (!allowedExtensions.includes(fileExtension)) {
        alert('File không hợp lệ. Chỉ chấp nhận các định dạng: JPG, JPEG, PNG, GIF, WEBP.')
        e.target.value = '' // Reset input
        return
      }
      
      // Validate file type (MIME type)
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
        alert('File không hợp lệ. Chỉ chấp nhận các định dạng: JPG, JPEG, PNG, GIF, WEBP.')
        e.target.value = '' // Reset input
        return
      }
      
      // Validate file size (max 10MB theo backend)
      if (file.size > 10 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 10MB.')
        e.target.value = '' // Reset input
        return
      }

      setSelectedImage(file)
      
      // Tạo preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  /**
   * Function: Handle khi submit form
   * 
   * Xử lý submit form:
   * 1. Prevent default form submission
   * 2. Lấy data từ form
   * 3. Validate email và phone number
   * 4. Gọi onSave callback với data phù hợp (CampusRequest hoặc CampusWithImageRequest)
   * 
   * @param {React.FormEvent<HTMLFormElement>} e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Lấy data từ form bằng FormData API
    const formData = new FormData(e.currentTarget)

    // Validate email format
    const email = formData.get('email')?.toString() || ''
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (email && !emailRegex.test(email)) {
      alert('Email không hợp lệ. Vui lòng nhập email đúng định dạng.')
      return
    }

    // Validate phone number (basic validation)
    const phoneNumber = formData.get('phoneNumber')?.toString() || ''
    const phoneRegex = /^[0-9+\-\s()]+$/
    if (phoneNumber && !phoneRegex.test(phoneNumber)) {
      alert('Số điện thoại không hợp lệ. Vui lòng chỉ nhập số và các ký tự +, -, (, ).')
      return
    }

    try {
      if (!isEdit && !selectedImage) {
        alert('Vui lòng chọn ảnh campus')
        return
      }

      const campusData: CampusWithImageRequest = {
        name: formData.get('name')?.toString() || '',
        address: formData.get('address')?.toString() || undefined,
        phoneNumber: phoneNumber || undefined,
        email: email || undefined,
        status: (formData.get('status')?.toString() || 'Active') as 'Active' | 'Inactive',
        image: selectedImage ?? undefined,
      }

      await onSave(campusData)
      // Nếu thành công, parent component sẽ đóng form
    } catch (error) {
      // Error đã được xử lý trong parent component (CampusManagement)
      // Chỉ log để debug
      console.error('Error saving campus:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-lg border border-gray-200 bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 p-6 flex-shrink-0">
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

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 overflow-y-auto flex-1">
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
                    onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      target.value = target.value.replace(/[^0-9+\-\s()]/g, '');
                    }}
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

              {/* Image Upload Field */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  <ImageIcon className="mr-1 inline h-4 w-4" />
                  Ảnh campus {isEdit ? <span className="text-gray-500 text-xs">(giữ ảnh cũ nếu không chọn ảnh mới)</span> : <span className="text-red-500">*</span>}
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1 disabled:bg-gray-100 disabled:cursor-not-allowed file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  />
                  {(imagePreview || campus?.imageUrl) && (
                    <div className="mt-2">
                      <p className="mb-2 text-xs text-gray-600">Preview:</p>
                      <img
                        src={imagePreview ?? campus?.imageUrl}
                        alt="Preview"
                        className="max-h-48 w-full rounded-lg border border-gray-200 object-cover"
                      />
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Ảnh sẽ được upload lên Cloudinary. Định dạng: JPG, JPEG, PNG, GIF, WEBP. Kích thước tối đa: 10MB
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 p-6 flex justify-end gap-3 flex-shrink-0">
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

