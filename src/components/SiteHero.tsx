import Link from 'next/link'

const featureCards = [
  { icon: '⚾', title: '四大聯盟戰績', body: '快速查看 NPB、MLB、CPBL、KBO 排名。' },
  { icon: '🇹🇼', title: '台灣旅外球員', body: '關注旅日、旅美、旅韓球員的近況。' },
  { icon: '📰', title: '棒球消息整理', body: '掌握賽程、戰績與重要動態。' },
]

export default function SiteHero() {
  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-8 sm:pb-12 sm:pt-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-72 max-w-5xl rounded-full bg-ocean-wave/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-44 w-44 -translate-x-1/2 rounded-full border border-ocean-wave/10" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-ocean-wave/20 bg-ocean-deep/65 px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-ocean-foam/75 shadow-ocean-subtle">
            <span className="h-1.5 w-1.5 rounded-full bg-seafoam shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
            Studio Imori Baseball
          </div>

          <h1 className="text-balance text-4xl font-black tracking-tight text-shell-white sm:text-5xl lg:text-6xl">
            伊森の国際野球航路
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-ocean-foam/80 sm:text-lg">
            追蹤台灣旅外球員，整合 NPB、MLB、CPBL、KBO 戰績與最新動態。
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/standings" className="inline-flex w-full items-center justify-center rounded-full bg-ocean-wave px-5 py-3 text-sm font-bold text-ocean-abyss shadow-ocean-glow transition-transform hover:-translate-y-0.5 hover:bg-ocean-foam sm:w-auto">
              查看聯盟戰績
            </Link>
            <Link href="/players" className="inline-flex w-full items-center justify-center rounded-full border border-ocean-light/20 bg-ocean-deep/55 px-5 py-3 text-sm font-bold text-shell-white transition-colors hover:border-ocean-wave/45 hover:bg-ocean-mid/55 sm:w-auto">
              查看旅外球員
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3">
          {featureCards.map((item) => (
            <div key={item.title} className="rounded-2xl border border-ocean-light/10 bg-ocean-deep/45 px-4 py-4 text-left shadow-ocean-subtle backdrop-blur">
              <div className="text-xl">{item.icon}</div>
              <div className="mt-2 text-sm font-bold text-shell-white">{item.title}</div>
              <p className="mt-1 text-[12px] leading-5 text-stone-gray/70">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
