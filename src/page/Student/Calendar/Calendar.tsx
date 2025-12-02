import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getFacilityById, 
  getTimeSlotsByFacility, 
  getAvailableTimeSlots,
  type TimeSlot,
  type Facility 
} from '../../../data/mockData';
import BookingModal from './component/BookingModal';

export default function Calendar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  useEffect(() => {
    if (id) {
      const facilityData = getFacilityById(id);
      if (facilityData) {
        setFacility(facilityData);
        loadTimeSlots(id, selectedDate);
      } else {
        navigate('/');
      }
    }
  }, [id, selectedDate, navigate]);

  const loadTimeSlots = (facilityId: string, date: string) => {
    const slots = getTimeSlotsByFacility(facilityId, date);
    setTimeSlots(slots);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    if (id) {
      loadTimeSlots(id, date);
    }
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.status === 'available') {
      setSelectedSlot(slot);
      setShowBookingModal(true);
    }
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    setSelectedSlot(null);
    if (id) {
      loadTimeSlots(id, selectedDate);
    }
  };

  const getDateRange = () => {
    const dates: string[] = [];
    const startDate = new Date(selectedDate);
    const daysToShow = viewMode === 'day' ? 1 : 7;
    
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const generateTimeSlots = (facility: Facility) => {
    const slots: { time: string; label: string }[] = [];
    const [openHour, openMin] = facility.operatingHours.open.split(':').map(Number);
    const [closeHour, closeMin] = facility.operatingHours.close.split(':').map(Number);
    
    let currentHour = openHour;
    let currentMin = openMin;
    
    while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
      const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      slots.push({ time: timeStr, label: timeStr });
      
      currentMin += 60;
      if (currentMin >= 60) {
        currentHour += 1;
        currentMin = 0;
      }
    }
    
    return slots;
  };

  const getSlotForTime = (date: string, time: string): TimeSlot | null => {
    return timeSlots.find(slot => 
      slot.date === date && 
      slot.startTime === time
    ) || null;
  };

  const getSlotStatusClass = (status: string) => {
    const statusMap = {
      available: 'bg-green-50 border-green-200 hover:bg-green-100 cursor-pointer',
      booked: 'bg-red-50 border-red-200 cursor-not-allowed opacity-60',
      pending: 'bg-yellow-50 border-yellow-200 cursor-not-allowed opacity-60',
      maintenance: 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-40'
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.available;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return `${days[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    const days = viewMode === 'day' ? 1 : 7;
    currentDate.setDate(currentDate.getDate() + (direction === 'next' ? days : -days));
    handleDateChange(currentDate.toISOString().split('T')[0]);
  };

  if (!facility) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  const dates = getDateRange();
  const timeSlotsList = generateTimeSlots(facility);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{facility.name}</h1>
              <p className="text-gray-600 mt-1">{facility.type} • {facility.campus}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'day' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Ngày
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'week' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Tuần
              </button>
            </div>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-700 font-medium">
                {viewMode === 'day' ? formatDate(selectedDate) : `${formatDate(dates[0])} - ${formatDate(dates[dates.length - 1])}`}
              </span>
            </div>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-24">Giờ</th>
                  {dates.map((date) => (
                    <th key={date} className="px-4 py-3 text-center text-sm font-semibold text-gray-700 min-w-[200px]">
                      <div>{formatDate(date)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlotsList.map((timeSlot) => (
                  <tr key={timeSlot.time} className="border-t border-gray-200">
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">
                      {timeSlot.label}
                    </td>
                    {dates.map((date) => {
                      const slot = getSlotForTime(date, timeSlot.time);
                      const status = slot?.status || 'available';
                      return (
                        <td key={date} className="px-2 py-2">
                          {slot ? (
                            <div
                              onClick={() => handleSlotClick(slot)}
                              className={`p-3 rounded-lg border-2 transition-all ${getSlotStatusClass(status)}`}
                            >
                              <div className="text-xs font-medium mb-1">
                                {slot.startTime} - {slot.endTime}
                              </div>
                              <div className="text-xs">
                                {status === 'available' && 'Trống'}
                                {status === 'booked' && 'Đã đặt'}
                                {status === 'pending' && 'Chờ duyệt'}
                                {status === 'maintenance' && 'Bảo trì'}
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 rounded-lg border-2 border-gray-100 bg-gray-50 opacity-40">
                              <div className="text-xs text-gray-400">-</div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Chú thích:</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-50 border-2 border-green-200 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Trống</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-50 border-2 border-red-200 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Đã đặt</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-50 border-2 border-yellow-200 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Chờ duyệt</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Bảo trì</span>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        {showBookingModal && selectedSlot && (
          <BookingModal
            facility={facility}
            timeSlot={selectedSlot}
            onClose={() => {
              setShowBookingModal(false);
              setSelectedSlot(null);
            }}
            onSuccess={handleBookingSuccess}
          />
        )}
      </div>
    </div>
  );
}

