import { Link } from 'react-router-dom'
import { useAuth } from '../../../../hooks/useAuth'

const HeroSection = () => {
  const { isAuthenticated } = useAuth()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-purple-700 text-white">
      <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-purple-900/30 blur-3xl" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-16 text-center lg:py-24">
        <div className="max-w-2xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-100">
            FPT University HCMC · Multi‑campus
          </p>
          <h1 className="text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            Lên kế hoạch học tập, giảng dạy và sự kiện với{' '}
            <span className="underline decoration-orange-200 decoration-4 underline-offset-4">
              hệ thống đặt phòng thông minh
            </span>
            .
          </h1>
          <p className="text-sm text-orange-50 sm:text-base">
            Một nơi duy nhất để sinh viên và giảng viên khám phá các phòng học, phòng lab và sân thể thao có sẵn tại các campus HCM &
            NVH, gửi yêu cầu đặt phòng và theo dõi phê duyệt theo thời gian thực.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {!isAuthenticated && (
              <Link
                to="/login"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-orange-600 shadow-lg shadow-orange-900/30 hover:bg-orange-50"
              >
                Đăng nhập để bắt đầu đặt phòng
              </Link>
            )}
            {isAuthenticated && (
              <Link
                to="/facilities"
                className="rounded-full border border-orange-100/70 bg-orange-500/10 px-5 py-2.5 text-sm font-semibold text-orange-50 hover:bg-orange-500/20"
              >
                Xem cơ sở vật chất
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection


