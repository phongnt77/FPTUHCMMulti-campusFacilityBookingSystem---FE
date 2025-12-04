const steps = [
  {
    id: 1,
    title: 'Đăng nhập',
    description: 'Đăng nhập bằng tài khoản đại học (K19+) hoặc email FPT cho sinh viên và giảng viên K18.',
  },
  {
    id: 2,
    title: 'Trang chủ & chọn campus',
    description: 'Bắt đầu từ trang chủ, chọn campus của bạn (HCM hoặc NVH) để xem các cơ sở vật chất liên quan.',
  },
  {
    id: 3,
    title: 'Chọn cơ sở vật chất & thời gian',
    description: 'Duyệt các phòng học, phòng lab và sân thể thao với các khung giờ trống theo thời gian thực.',
  },
  {
    id: 4,
    title: 'Chi tiết cơ sở & đặt phòng',
    description: 'Xem xét sức chứa phòng, thiết bị và quy định, sau đó gửi yêu cầu đặt phòng.',
  },
  {
    id: 5,
    title: 'Phê duyệt của quản trị viên',
    description: 'Quản trị viên cơ sở vật chất duyệt hoặc từ chối yêu cầu của bạn, dựa trên chính sách và xung đột.',
  },
  {
    id: 6,
    title: 'Quay lại trang chủ',
    description: 'Nhận thông báo trên trang chủ về trạng thái đặt phòng và việc sử dụng sắp tới.',
  },
]

const FlowSection = () => {
  return (
    <section className="bg-gray-50 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Quy trình đặt phòng cho sinh viên & giảng viên</h2>
            <p className="mt-1 text-sm text-gray-600">
              Từ lần đăng nhập đầu tiên đến đặt phòng được xác nhận, hệ thống hướng dẫn bạn từng bước.
            </p>
          </div>
          <p className="max-w-xs text-xs text-gray-500">
            Quy trình này được chia sẻ cho cả campus HCM và NVH, đảm bảo trải nghiệm nhất quán trên tất cả địa điểm.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className="group relative overflow-hidden rounded-xl border border-orange-100 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">
                  {step.id}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-orange-500">
                  {step.id <= 2 ? 'Bắt đầu' : step.id <= 4 ? 'Đặt phòng' : 'Kết quả'}
                </span>
              </div>
              <h3 className="mb-1 text-sm font-semibold text-gray-900">{step.title}</h3>
              <p className="text-xs text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FlowSection


