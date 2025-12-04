import { Building2, MapPin, Users, FileText, X } from 'lucide-react'
import type { Facility } from '../../../../types'

interface FacilityFormProps {
  facility: Partial<Facility> | null
  onClose: () => void
  onSave: (facility: Partial<Facility>) => void
}

const FacilityForm = ({ facility, onClose, onSave }: FacilityFormProps) => {
  const isEdit = facility?.id !== undefined

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const amenities = formData.get('amenities')?.toString().split(',').map((a) => a.trim()).filter(Boolean) || []

    const facilityData: Partial<Facility> = {
      name: formData.get('name')?.toString() || '',
      type: formData.get('type')?.toString() as Facility['type'],
      campus: formData.get('campus')?.toString() as Facility['campus'],
      capacity: Number(formData.get('capacity')) || 0,
      location: formData.get('location')?.toString() || '',
      description: formData.get('description')?.toString() || '',
      amenities,
      isActive: formData.get('isActive') === 'true'
    }

    if (isEdit && facility.id) {
      facilityData.id = facility.id
    }

    onSave(facilityData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Facility' : 'Add New Facility'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  <Building2 className="mr-1 inline h-4 w-4" />
                  Facility Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={facility?.name || ''}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  defaultValue={facility?.type || ''}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1"
                >
                  <option value="">Select type</option>
                  <option value="meeting-room">Meeting Room</option>
                  <option value="lab-room">Lab Room</option>
                  <option value="sports-field">Sports Field</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  <MapPin className="mr-1 inline h-4 w-4" />
                  Campus <span className="text-red-500">*</span>
                </label>
                <select
                  name="campus"
                  defaultValue={facility?.campus || ''}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1"
                >
                  <option value="">Select campus</option>
                  <option value="HCM">HCM Campus</option>
                  <option value="NVH">NVH Campus</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  <Users className="mr-1 inline h-4 w-4" />
                  Capacity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="capacity"
                  defaultValue={facility?.capacity || ''}
                  min="1"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                <MapPin className="mr-1 inline h-4 w-4" />
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                defaultValue={facility?.location || ''}
                placeholder="e.g. Tầng 3, Tòa A"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                <FileText className="mr-1 inline h-4 w-4" />
                Description
              </label>
              <textarea
                name="description"
                defaultValue={facility?.description || ''}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Amenities</label>
              <input
                type="text"
                name="amenities"
                defaultValue={facility?.amenities?.join(', ') || ''}
                placeholder="e.g. Projector, WiFi, AC (comma separated)"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1"
              />
              <p className="mt-1 text-xs text-gray-500">Separate amenities with commas</p>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  value="true"
                  defaultChecked={facility?.isActive !== false}
                  className="h-4 w-4 rounded border-gray-300 text-orange-500"
                />
                <span className="text-sm font-semibold text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 transition-colors"
            >
              {isEdit ? 'Update Facility' : 'Create Facility'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FacilityForm

