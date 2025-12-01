import { BookingStatus, getBookingStatusLabel, getBookingStatusColor } from '../../data/mockData';

interface StatusBadgeProps {
  status: BookingStatus;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${getBookingStatusColor(status)} ${sizeClasses[size]}`}
    >
      {getBookingStatusLabel(status)}
    </span>
  );
}

