import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, Users, Clock, Calendar, ChevronLeft, ChevronRight, 
  Building2, FlaskConical, Trophy, Check, X, AlertCircle,
  FileText, UserCheck, Loader2, CheckCircle2, Info
} from 'lucide-react';
import type { Facility, FacilityType } from '../../../types';
import { bookingApi, type TimeSlot, type BookingRequest } from './api/api';
import { useAuthState } from '../../../hooks/useAuthState';

const BookingPage = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthState();
  
  // States
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [purpose, setPurpose] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [notes, setNotes] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');

  // Initialize with today's date
  useEffect(() => {
    const today = new Date();
    setSelectedDate(today.toISOString().split('T')[0]);
  }, []);

  // Load facility details
  useEffect(() => {
    const loadFacility = async () => {
      if (!facilityId) return;
      
      setLoading(true);
      try {
        const data = await bookingApi.getFacilityById(facilityId);
        setFacility(data);
      } catch (error) {
        console.error('Error loading facility:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFacility();
  }, [facilityId]);

  // Load time slots when date changes
  const loadTimeSlots = useCallback(async () => {
    if (!facilityId || !selectedDate) return;
    
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const slots = await bookingApi.getAvailableTimeSlots(facilityId, selectedDate);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error loading time slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  }, [facilityId, selectedDate]);

  useEffect(() => {
    loadTimeSlots();
  }, [loadTimeSlots]);

  // Helper functions
  const getFacilityTypeLabel = (type: FacilityType): string => {
    const labels: Record<string, string> = {
      'Classroom': 'Phòng học',
      'Meeting Room': 'Phòng họp',
      'Laboratory': 'Phòng Lab',
      'Sport Facility': 'Sân thể thao',
      'meeting-room': 'Phòng họp',
      'lab-room': 'Phòng Lab',
      'sports-field': 'Sân thể thao',
    };
    return labels[type] || type;
  };

  const getFacilityTypeIcon = (type: FacilityType) => {
    switch (type) {
      case 'Meeting Room':
      case 'meeting-room':
      case 'Classroom':
        return <Building2 className="w-6 h-6" />;
      case 'Laboratory':
      case 'lab-room':
        return <FlaskConical className="w-6 h-6" />;
      case 'Sport Facility':
      case 'sports-field':
        return <Trophy className="w-6 h-6" />;
    }
  };

  const getFacilityTypeColor = (type: FacilityType) => {
    const colors: Record<string, { bg: string; text: string; gradient: string }> = {
      'Classroom': { 
        bg: 'bg-blue-100', 
        text: 'text-blue-700',
        gradient: 'from-blue-500 to-indigo-600'
      },
      'Meeting Room': { 
        bg: 'bg-violet-100', 
        text: 'text-violet-700',
        gradient: 'from-violet-500 to-purple-600'
      },
      'meeting-room': { 
        bg: 'bg-violet-100', 
        text: 'text-violet-700',
        gradient: 'from-violet-500 to-purple-600'
      },
      'Laboratory': { 
        bg: 'bg-amber-100', 
        text: 'text-amber-700',
        gradient: 'from-amber-500 to-orange-600'
      },
      'lab-room': { 
        bg: 'bg-amber-100', 
        text: 'text-amber-700',
        gradient: 'from-amber-500 to-orange-600'
      },
      'Sport Facility': { 
        bg: 'bg-emerald-100', 
        text: 'text-emerald-700',
        gradient: 'from-emerald-500 to-teal-600'
      },
      'sports-field': { 
        bg: 'bg-emerald-100', 
        text: 'text-emerald-700',
        gradient: 'from-emerald-500 to-teal-600'
      },
    };
    return colors[type] || { bg: 'bg-gray-100', text: 'text-gray-700', gradient: 'from-gray-500 to-gray-600' };
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getMinDate = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  const getMaxDate = (): string => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 14); // Allow booking up to 14 days in advance
    return maxDate.toISOString().split('T')[0];
  };

  const changeDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    const minDate = new Date(getMinDate());
    const maxDate = new Date(getMaxDate());
    
    if (current >= minDate && current <= maxDate) {
      setSelectedDate(current.toISOString().split('T')[0]);
    }
  };

  // Check if facility is a sports field (capacity === -1 or type is Sport Facility/sports-field)
  const isSportsField = facility && (
    facility.capacity === -1 || 
    facility.type === 'Sport Facility' || 
    facility.type === 'sports-field'
  );
  
  const canSubmit = selectedSlot && purpose.trim() && (isSportsField || numberOfPeople > 0);

  const handleOpenConfirmModal = () => {
    if (canSubmit) {
      setShowConfirmModal(true);
    }
  };

  const handleSubmitBooking = async () => {
    if (!facility || !selectedSlot || !canSubmit || !user) return;

    setSubmitting(true);
    try {
      const bookingRequest: BookingRequest = {
        facilityId: facility.id,
        userId: user.user_id,
        date: selectedDate,
        timeSlotId: selectedSlot.id,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        purpose: purpose.trim(),
        numberOfPeople: isSportsField ? 1 : numberOfPeople, // Default to 1 for sports fields
        notes: notes.trim() || undefined,
      };

      const response = await bookingApi.submitBooking(bookingRequest);
      
      // Xử lý khi booking bị rejected (lỗi validation từ backend)
      if (response.status === 'rejected') {
        // Kiểm tra nếu lỗi yêu cầu cập nhật profile (số điện thoại, email, MSSV)
        const profileRequiredErrors = [
          'số điện thoại',
          'phone',
          'email',
          'mssv',
          'hồ sơ cá nhân',
          'profile',
          'student'
        ];
        
        const isProfileError = profileRequiredErrors.some(
          keyword => response.message.toLowerCase().includes(keyword)
        );
        
        if (isProfileError) {
          // Hiển thị confirm dialog để chuyển đến trang profile
          const shouldRedirect = window.confirm(
            `${response.message}\n\nBạn có muốn đến trang Hồ sơ để cập nhật thông tin không?`
          );
          
          if (shouldRedirect) {
            setShowConfirmModal(false);
            navigate('/profile');
            return;
          }
        } else {
          // Lỗi khác, hiển thị thông báo
          alert(response.message);
        }
        return;
      }
      
      setBookingId(response.id);
      setBookingSuccess(true);
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Có lỗi xảy ra khi đặt phòng. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSuccessAndRedirect = () => {
    setShowConfirmModal(false);
    setBookingSuccess(false);
    navigate('/facilities');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  // Facility not found
  if (!facility) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy cơ sở</h2>
          <p className="text-gray-600 mb-6">
            Cơ sở vật chất này không tồn tại hoặc không khả dụng để đặt.
          </p>
          <Link
            to="/facilities"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const colors = getFacilityTypeColor(facility.type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      {/* Header */}
      <div className={`relative overflow-hidden bg-gradient-to-r ${colors.gradient}`}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-8">
          <Link
            to="/facilities"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại danh sách
          </Link>
          
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white`}>
              {getFacilityTypeIcon(facility.type)}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {facility.name}
              </h1>
              <p className="text-white/80 text-sm">
                {getFacilityTypeLabel(facility.type)} • {facility.campus} Campus
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Facility Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Facility Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${colors.gradient}`} />
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-gray-400" />
                  Thông tin chi tiết
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Vị trí</p>
                      <p className="text-sm text-gray-600">{facility.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Sức chứa</p>
                      <p className="text-sm text-gray-600">
                        {facility.capacity === -1 ? 'Nhiều người' : `${facility.capacity} người`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Giờ hoạt động</p>
                      <p className="text-sm text-gray-600">07:00 - 21:00</p>
                    </div>
                  </div>
                </div>

                {facility.description && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">{facility.description}</p>
                  </div>
                )}

                {facility.amenities && facility.amenities.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-900 mb-2">Tiện ích</p>
                    <div className="flex flex-wrap gap-2">
                      {facility.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className={`px-2.5 py-1 ${colors.bg} ${colors.text} rounded-full text-xs font-medium`}
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Tips */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-100">
              <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Lưu ý khi đặt phòng
              </h4>
              <ul className="space-y-2 text-sm text-orange-800">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Đặt phòng trước tối đa 14 ngày</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Yêu cầu sẽ được xét duyệt trong 24h</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Hủy đặt phòng trước 2 giờ sử dụng</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Đặt phòng</h2>
                <p className="text-sm text-gray-500 mt-1">Chọn ngày, giờ và điền thông tin để đặt phòng</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Date Selection - Visual Calendar */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Chọn ngày đặt phòng
                  </label>
                  
                  {/* Week Navigation */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => changeDate(-7)}
                      disabled={new Date(selectedDate).getTime() - 7 * 24 * 60 * 60 * 1000 < new Date(getMinDate()).getTime()}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Tuần trước
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                      {new Date(selectedDate).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => changeDate(7)}
                      disabled={new Date(selectedDate).getTime() + 7 * 24 * 60 * 60 * 1000 > new Date(getMaxDate()).getTime()}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Tuần sau
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Calendar Grid - Show 14 days */}
                  <div className="grid grid-cols-7 gap-2 mb-3">
                    {/* Day headers */}
                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                        {day}
                      </div>
                    ))}
                    
                    {/* Date buttons - Show next 14 days */}
                    {Array.from({ length: 14 }, (_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() + i);
                      const dateStr = date.toISOString().split('T')[0];
                      const isSelected = dateStr === selectedDate;
                      const isToday = i === 0;
                      const dayOfWeek = date.getDay();
                      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                      
                      return (
                        <button
                          key={dateStr}
                          onClick={() => setSelectedDate(dateStr)}
                          className={`relative p-2 rounded-lg text-center transition-all ${
                            isSelected
                              ? `bg-gradient-to-r ${colors.gradient} text-white shadow-md`
                              : isToday
                              ? 'bg-orange-50 text-orange-700 border-2 border-orange-300 hover:bg-orange-100'
                              : isWeekend
                              ? 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <div className="text-lg font-semibold">{date.getDate()}</div>
                          <div className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                            {date.toLocaleDateString('vi-VN', { weekday: 'short' })}
                          </div>
                          {isToday && !isSelected && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected date display */}
                  <div className={`p-3 rounded-lg ${colors.bg} flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <Calendar className={`w-5 h-5 ${colors.text}`} />
                      <span className={`font-medium ${colors.text}`}>
                        {formatDate(selectedDate)}
                      </span>
                    </div>
                    {selectedDate === getMinDate() && (
                      <span className={`text-xs px-2 py-0.5 rounded-full bg-white/50 ${colors.text}`}>
                        Hôm nay
                      </span>
                    )}
                  </div>

                  {/* Alternative: Native date picker for accessibility */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Hoặc chọn ngày cụ thể:</span>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={getMinDate()}
                      max={getMaxDate()}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Chọn khung giờ
                  </label>
                  
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                      <span className="ml-2 text-gray-600">Đang tải lịch...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => slot.isAvailable && setSelectedSlot(slot)}
                          disabled={!slot.isAvailable}
                          className={`p-2.5 rounded-lg text-sm font-medium transition-all ${
                            selectedSlot?.id === slot.id
                              ? `bg-gradient-to-r ${colors.gradient} text-white shadow-md`
                              : slot.isAvailable
                              ? 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                          }`}
                        >
                          {slot.startTime}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {selectedSlot && (
                    <div className={`mt-3 p-3 rounded-lg ${colors.bg} flex items-center gap-2`}>
                      <Check className={`w-4 h-4 ${colors.text}`} />
                      <span className={`text-sm font-medium ${colors.text}`}>
                        Đã chọn: {selectedSlot.startTime} - {selectedSlot.endTime}
                      </span>
                    </div>
                  )}
                  
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-gray-50 border border-gray-200" />
                      <span>Còn trống</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-gray-100" />
                      <span>Đã đặt</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-3 h-3 rounded bg-gradient-to-r ${colors.gradient}`} />
                      <span>Đang chọn</span>
                    </div>
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Mục đích sử dụng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="VD: Họp nhóm dự án, Thực hành môn học..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                {/* Number of People - Hidden for sports fields */}
                {!isSportsField && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      <UserCheck className="w-4 h-4 inline mr-2" />
                      Số người tham gia <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={numberOfPeople}
                      onChange={(e) => setNumberOfPeople(Math.max(1, Math.min(facility.capacity, parseInt(e.target.value) || 1)))}
                      min={1}
                      max={facility.capacity}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tối đa {facility.capacity} người
                    </p>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Ghi chú thêm (tùy chọn)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Yêu cầu đặc biệt, thiết bị cần chuẩn bị..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleOpenConfirmModal}
                  disabled={!canSubmit}
                  className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
                    canSubmit
                      ? `bg-gradient-to-r ${colors.gradient} hover:opacity-90 shadow-lg`
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  Xác nhận đặt phòng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
              onClick={() => !submitting && !bookingSuccess && setShowConfirmModal(false)}
            />
            
            <div className="relative inline-block w-full max-w-lg my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-2xl shadow-xl">
              {!bookingSuccess ? (
                <>
                  {/* Modal Header */}
                  <div className={`px-6 py-4 bg-gradient-to-r ${colors.gradient}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">
                        Xác nhận đặt phòng
                      </h3>
                      {!submitting && (
                        <button
                          onClick={() => setShowConfirmModal(false)}
                          className="text-white/80 hover:text-white transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Modal Content */}
                  <div className="px-6 py-5">
                    <div className="space-y-4">
                      {/* Facility Info */}
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <div className={`w-12 h-12 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center`}>
                          {getFacilityTypeIcon(facility.type)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{facility.name}</h4>
                          <p className="text-sm text-gray-500">{facility.location}</p>
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Ngày</span>
                          <span className="font-medium text-gray-900">{formatDate(selectedDate)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Thời gian</span>
                          <span className="font-medium text-gray-900">
                            {selectedSlot?.startTime} - {selectedSlot?.endTime}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Mục đích</span>
                          <span className="font-medium text-gray-900">{purpose}</span>
                        </div>
                        {!isSportsField && (
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Số người</span>
                            <span className="font-medium text-gray-900">{numberOfPeople} người</span>
                          </div>
                        )}
                        {notes && (
                          <div className="py-2">
                            <span className="text-sm text-gray-600 block mb-1">Ghi chú</span>
                            <span className="text-sm text-gray-900">{notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Warning */}
                      <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800">
                          Sau khi gửi, yêu cầu sẽ được xét duyệt. Bạn sẽ nhận thông báo qua email khi có kết quả.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-6 py-4 bg-gray-50 flex gap-3">
                    <button
                      onClick={() => setShowConfirmModal(false)}
                      disabled={submitting}
                      className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSubmitBooking}
                      disabled={submitting}
                      className={`flex-1 px-4 py-2.5 bg-gradient-to-r ${colors.gradient} text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2`}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Xác nhận
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                // Success State
                <div className="p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Đặt phòng thành công!
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Yêu cầu của bạn đã được gửi và đang chờ xét duyệt.
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Mã đặt phòng: <span className="font-mono font-semibold text-gray-900">{bookingId}</span>
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => navigate('/my-bookings')}
                      className={`px-6 py-2.5 bg-gradient-to-r ${colors.gradient} text-white rounded-xl font-medium hover:opacity-90 transition-opacity`}
                    >
                      Xem lịch sử đặt
                    </button>
                    <button
                      onClick={handleCloseSuccessAndRedirect}
                      className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      Đặt phòng khác
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;


