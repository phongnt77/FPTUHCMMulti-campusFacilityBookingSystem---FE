import { CalendarRange, MapPin, Clock, Bell } from 'lucide-react'

const cards = [
  {
    title: 'Lên kế hoạch theo phòng thực tế',
    description: 'Nhanh chóng xem phòng học, phòng lab hoặc sân thể thao nào còn trống trước khi bạn lên lịch.',
    icon: CalendarRange,
  },
  {
    title: 'Chọn đúng campus và không gian',
    description: 'Lọc theo campus HCM hoặc NVH và tập trung vào các cơ sở vật chất phù hợp với nhu cầu giảng dạy hoặc học tập của bạn.',
    icon: MapPin,
  },
  {
    title: 'Tránh xung đột thời gian',
    description: 'Hệ thống làm nổi bật các khung giờ trống để bạn không đến phòng đã được đặt.',
    icon: Clock,
  },
  {
    title: 'Cập nhật thông tin từ một nơi',
    description: 'Từ trang chủ, bạn có thể xem các đặt phòng sắp tới và thông báo quan trọng về cơ sở vật chất của bạn.',
    icon: Bell,
  },
]

const FeatureSection = () => {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Những gì chúng tôi mang lại</h2>
          <p className="mt-2 text-sm text-gray-600">
            Là sinh viên hoặc giảng viên, trang này là điểm khởi đầu để bạn hiểu về campus, tìm đúng
            cơ sở vật chất và hành động nhanh chóng.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {cards.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="flex gap-4 rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-5 shadow-sm"
            >
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-orange-600">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="mb-1 text-sm font-semibold text-gray-900">{title}</h3>
                <p className="text-xs text-gray-600">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeatureSection


