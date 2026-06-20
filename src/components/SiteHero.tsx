import Link from 'next/link'

const featureChips = [
  '台灣旅外球員情報',
  '四聯盟戰績整合',
  'DB-first live sync',
]

export default function SiteHero() {
  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-8 sm:pb-12 sm:pt-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-72 max-w-5xl rounded-full bg-ocean-wave/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-44 w-44 -translate-x-1/2 rounded-full border border-ocean-wave/10" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-ocean-wave/20 bg-ocean-deep/65 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-ocean-foam/75 shadow-ocean-subtle">
            <span className="h-1.5 w-1.5 rounded-full bg-seafoam shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
            Studio Imori Baseball
          </div>

          <h1 className="text-balance text-4xl font-black tracking-tight text-shell-white sm:text-5xl lg:text-6xl">
            伊森の国際野球航路
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-ocean-foam/80 sm:text-lg">
            聚焦台灣旅外球員、海外聯盟戰績與每日賽程，把 NPB・MLB・CPBL・KBO 整理成一個真正可追蹤的棒球情報中樞。
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {featureChips.map((chip) => (
              <span key={chip} className="rounded-full border border-ocean-light/15 bg-ocean-mid/35 px-3 py-1.5 text-[12px] font-medium text-stone-gray/85">
                {chip}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/standings" className="inline-flex w-full items-center justify-center rounded-full bg-ocean-wave px-5 py-3 text-sm font-bold text-ocean-abyss shadow-ocean-glow transition-transform hover:-translate-y-0.5 hover:bg-ocean-foam sm:w-auto">
              查看四聯盟戰績
            </Link>
            <Link href="/players" className="inline-flex w-full items-center justify-center rounded-full border border-ocean-light/20 bg-ocean-deep/55 px-5 py-3 text-sm font-bold text-shell-white transition-colors hover:border-ocean-wave/45 hover:bg-ocean-mid/55 sm:w-auto">
              追蹤旅外球員
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3">
          <HeroMetric label="Leagues" value="NPB / MLB / CPBL / KBO" />
          <HeroMetric label="Focus" value="Taiwan Overseas Players" />
          <HeroMetric label="Pipeline" value="Live → DB → Frontend" />
        </div>
      </div>
    </section>
  )
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ocean-light/10 bg-ocean-deep/45 px-4 py-4 text-center shadow-ocean-subtle backdrop-blur">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-gray/45">{label}</div>
      <div className="mt-1 text-sm font-bold text-shell-white">{value}</div>
    </div>
  )
}
