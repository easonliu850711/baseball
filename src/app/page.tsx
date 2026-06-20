'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import SiteHero from '@/components/SiteHero'
import LeagueTabs from '@/components/LeagueTabs'
import StandingsTable from '@/components/StandingsTable'
import HomeHighlights from '@/components/HomeHighlights'
import PlayerSpotlightList from '@/components/PlayerSpotlightList'
import NewsFeedList from '@/components/NewsFeedList'
import { fetchStandingsData, type LeagueType, type StandingsFetchResult } from '@/components/StandingsTable'

type FetchState = 'idle' | 'loading' | 'loaded' | 'error'

const leagueLabel: Record<LeagueType, string> = {
  npb: '日本職棒',
  cpbl: '中華職棒',
  mlb: '美國職棒',
  kbo: '韓國職棒',
}

export default function Home() {
  const [activeLeague, setActiveLeague] = useState<LeagueType>('npb')
  const [result, setResult] = useState<StandingsFetchResult | null>(null)
  const [fetchState, setFetchState] = useState<FetchState>('idle')
  const [loadError, setLoadError] = useState<string | null>(null)

  const doFetch = useCallback(async (league: LeagueType) => {
    setFetchState('loading')
    setLoadError(null)
    try {
      const data = await fetchStandingsData(league)
      setResult(data)
      setFetchState('loaded')
    } catch {
      setFetchState('error')
      setResult(null)
      setLoadError('戰績資料暫時無法讀取')
    }
  }, [])

  useEffect(() => {
    doFetch(activeLeague)
  }, [activeLeague, doFetch])

  return (
    <>
      <SiteHero />

      <div className="mx-auto max-w-6xl px-4 pb-12 sm:pb-16">
        {/* HomeHighlights */}
        <section className="mb-6">
          <HomeHighlights />
        </section>

        {/* Standings */}
        <section id="standings" className="mb-6 scroll-mt-24">
          <div className="overflow-hidden rounded-3xl border border-ocean-light/10 bg-ocean-deep/55 shadow-ocean-card backdrop-blur">
            <div className="border-b border-ocean-light/10 px-4 py-4 sm:px-6">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ocean-foam/45">Standings Board</div>
                  <h2 className="mt-1 text-lg font-black tracking-wide text-shell-white">{leagueLabel[activeLeague]}排行榜</h2>
                </div>
                <p className="text-[12px] text-stone-gray/55">以 API Core DB-first 資料源呈現最新戰績</p>
              </div>
              <LeagueTabs active={activeLeague} onChange={setActiveLeague} />
            </div>

            <div className="px-4 py-5 sm:px-6">
              {fetchState === 'loading' && (
                <div className="space-y-2 py-3">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-10 rounded-xl bg-ocean-mid/30 animate-pulse" />
                  ))}
                </div>
              )}

              {fetchState === 'error' && (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-8 text-center">
                  <p className="text-sm font-medium text-rose-300">{loadError || '載入失敗'}</p>
                  <button
                    onClick={() => doFetch(activeLeague)}
                    className="mt-3 rounded-full bg-ocean-mid/50 px-4 py-2 text-[12px] font-semibold text-shell-white shadow-sm"
                  >
                    重新載入
                  </button>
                </div>
              )}

              {fetchState === 'loaded' && result && (
                <StandingsTable teams={result.teams} compact blocks={result.blocks} />
              )}
            </div>

            <div className="border-t border-ocean-light/10 px-5 py-3 text-center">
              <Link href="/standings" className="text-[12px] font-semibold text-ocean-wave hover:text-ocean-foam transition-colors">
                查看完整戰績 →
              </Link>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="my-10 h-px bg-gradient-to-r from-transparent via-ocean-light/20 to-transparent" />

        {/* 2-col grid: PlayerSpotlightList + NewsFeedList */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PlayerSpotlightList />
          <NewsFeedList />
        </section>
      </div>
    </>
  )
}
