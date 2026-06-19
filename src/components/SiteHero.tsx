export default function SiteHero() {
  return (
    <div className="px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-shell-white sm:text-4xl">
          台灣旅外球員情報中樞
        </h1>
        <p className="mt-3 text-lg text-ocean-foam/80">
          伊森の国際野球航路
        </p>
        <p className="mt-1 text-sm italic text-stone-gray/50">
          Imori World Baseball Route
        </p>
        <p className="mt-4 text-[13px] tracking-wide text-stone-gray/40">
          NPB · MLB · CPBL · KBO 即時情報
        </p>
      </div>
      <div className="mx-auto mt-8 h-px w-48 bg-gradient-to-r from-transparent via-ocean-wave/40 to-transparent" />
    </div>
  )
}
