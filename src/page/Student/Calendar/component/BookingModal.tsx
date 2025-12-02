import { useState } from 'react';
import type { Facility, TimeSlot } from '../../../../data/mockData';

interface BookingModalProps {
  facility: Facility;
  timeSlot: TimeSlot;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookingModal({ facility, timeSlot, onClose, onSuccess }: BookingModalProps) {
  const [formData, setFormData] = useState({
    purpose: '',
    numberOfPeople: 1,
    equipmentRequests: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableEquipment = facility.amenities.filter(item => 
    !['WiFi', 'Đèn chiếu sáng', 'Quạt'].includes(item)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numberOfPeople' ? parseInt(value) || 1 : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleEquipmentToggle = (equipment: string) => {
    setFormData(prev => ({
      ...prev,
      equipmentRequests: prev.equipmentRequests.includes(equipment)
        ? prev.equipmentRequests.filter(e => e !== equipment)
        : [...prev.equipmentRequests, equipment]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Vui lòng nhập mục đích sử dụng';
    }

    if (formData.numberOfPeople < 1 || formData.numberOfPeople > facility.capacity) {
      newErrors.numberOfPeople = `Số lượng người phải từ 1 đến ${facility.capacity}`;
    }

    // Check if booking time is valid (not after 22:00)
    const [hour] = timeSlot.endTime.split(':').map(Number);
    if (hour > 22) {
      newErrors.time = 'Không thể đặt phòng sau 22:00';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real app, this would be an API call
    console.log('Booking request:', {
      facilityId: facility.id,
      timeSlotId: timeSlot.id,
      date: timeSlot.date,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      ...formData
    });

    setIsSubmitting(false);
    
    // Show success message
    alert('Yêu cầu đặt phòng đã được gửi! Bạn sẽ nhận được email xác nhận.');
    
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-blue-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Đặt phòng: {facility.name}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-white hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-6">
              {/* Time Slot Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Thông tin đặt phòng</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Ngày:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {new Date(timeSlot.date).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Giờ:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {timeSlot.startTime} - {timeSlot.endTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Cơ sở:</span>
                    <span className="ml-2 font-medium text-gray-900">{facility.campus}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Sức chứa:</span>
                    <span className="ml-2 font-medium text-gray-900">{facility.capacity} người</span>
                  </div>
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
                  Mục đích sử dụng <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="purpose"
                  name="purpose"
                  rows={3}
                  value={formData.purpose}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.purpose ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ví dụ: Họp nhóm dự án, Thuyết trình, Lớp học..."
                />
                {errors.purpose && (
                  <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>
                )}
              </div>

              {/* Number of People */}
              <div>
                <label htmlFor="numberOfPeople" className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng người <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="numberOfPeople"
                  name="numberOfPeople"
                  min="1"
                  max={facility.capacity}
                  value={formData.numberOfPeople}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.numberOfPeople ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.numberOfPeople && (
                  <p className="mt-1 text-sm text-red-600">{errors.numberOfPeople}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Tối đa {facility.capacity} người
                </p>
              </div>

              {/* Equipment Requests */}
              {availableEquipment.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yêu cầu thiết bị hỗ trợ (tùy chọn)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {availableEquipment.map((equipment) => (
                      <label
                        key={equipment}
                        className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.equipmentRequests.includes(equipment)}
                          onChange={() => handleEquipmentToggle(equipment)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{equipment}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Error message for time */}
              {errors.time && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{errors.time}</p>
                </div>
              )}

              {/* Info Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Yêu cầu đặt phòng của bạn sẽ được gửi đến Facility Admin để phê duyệt. 
                  Bạn sẽ nhận được email thông báo khi có kết quả.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang gửi...
                  </span>
                ) : (
                  'Gửi yêu cầu đặt phòng'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

