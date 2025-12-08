import { useState, useEffect } from 'react';
import { getMyFeedbacks, type MyFeedback } from '../api/myFeedbacksApi';
import { Loader2, MessageSquare, Star, AlertTriangle, CheckCircle } from 'lucide-react';

const MyFeedbacksTab = () => {
  const [feedbacks, setFeedbacks] = useState<MyFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getMyFeedbacks();

      if (response.success && response.data) {
        setFeedbacks(response.data);
      } else {
        setError(response.error?.message || 'Không thể tải danh sách feedbacks');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Feedbacks List */}
      {!isLoading && !error && feedbacks.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Bạn chưa có feedback nào</p>
        </div>
      )}

      {!isLoading && !error && feedbacks.length > 0 && (
        <div className="space-y-4">
          {feedbacks.map((feedback) => (
            <div
              key={feedback.feedbackId}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {feedback.facilityName}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Booking ID: {feedback.bookingId}</span>
                      {feedback.isResolved && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3" />
                          Đã xử lý
                        </span>
                      )}
                      {!feedback.isResolved && feedback.reportIssue && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                          <AlertTriangle className="w-3 h-3" />
                          Đang xử lý
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Đánh giá:</span>
                  {renderStars(feedback.rating)}
                </div>

                {/* Comments */}
                {feedback.comments && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Nhận xét:</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {feedback.comments}
                    </p>
                  </div>
                )}

                {/* Issue Report */}
                {feedback.reportIssue && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <p className="text-sm font-medium text-yellow-800">Báo cáo vấn đề</p>
                    </div>
                    {feedback.issueDescription && (
                      <p className="text-sm text-yellow-700">{feedback.issueDescription}</p>
                    )}
                    {feedback.resolvedAt && (
                      <p className="text-xs text-yellow-600 mt-2">
                        Đã xử lý lúc: {formatDateTime(feedback.resolvedAt)}
                      </p>
                    )}
                  </div>
                )}

                {/* Timestamp */}
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                  Tạo lúc: {formatDateTime(feedback.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyFeedbacksTab;

