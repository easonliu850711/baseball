'use client'

import { useState, useEffect, useCallback } from 'react'
import LeagueTabs from '@/components/LeagueTabs'
import StandingsTable from '@/components/StandingsTable'
import DataStatus from '@/components/DataStatus'
import HomeHighlights from '@/components/HomeHighlights'
import PlayerSpotlightList from '@/components/PlayerSpotlightList'
import NewsFeedList from '@/components/NewsFeedList'
import { fetchStandingsData, type Team, type LeagueType } from '@/components/StandingsTable'

type FetchState = 'idle' | 'loading' | 'loaded' | 'error'

const leagueLabel: Record<LeagueType, string> = {
  npb: '日本職棒',
  cpbl: '中華職棒',
  mlb: '美國職棒',
  kbo: '韓國職棒',
}

export default function Home() {
  const [activeLeague, setActiveLeague] = useState<LeagueType>('npb')
  const [teams, setTeams] = useState<Team[]>([])
  const [fetchState, setFetchState] = useState<FetchState>('idle')
  const [statusInfo, setStatusInfo] = useState<{ source: string; snapshot: string; generatedAt: string } | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const doFetch = useCallback(async (league: LeagueType) => {
    setFetchState('loading')
    setLoadError(null)
    try {
      const result = await fetchStandingsData(league)
      setTeams(result.teams || [])
      setFetchState('loaded')
      setStatusInfo({
        source: result.meta.source || 'unknown',
        snapshot: result.meta.snapshot || '',
        generatedAt: result.meta.generatedAt || '',
      })
    } catch {
      setFetchState('error')
      setTeams([])
      setLoadError('戰績資料暫時無法讀取')
    }
  }, [])

  useEffect(() => {
    doFetch(activeLeague)
  }, [activeLeague, doFetch])

  return (
    <div id="top" className="imori-page">
      <div className="imori-shell">
        <section className="mb-5 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="imori-card overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                  Baseball Intel
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700">
                  STG Preview
                </span>
              </div>
              <h1 className="text-2xl font-semibold leading-tight sm:text-4xl">
                台灣旅外球員情報中樞
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                以球員為核心，把 NPB、CPBL、MLB、KBO 的戰績、新聞與旅外狀態整理成一頁式情報面板。
              </p>
            </div>

            <div className="grid grid-cols-3 divide-x divide-slate-100">
              <div className="px-5 py-4">
                <div className="text-2xl font-semibold text-slate-950">28</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">Players</div>
              </div>
              <div className="px-5 py-4">
                <div className="text-2xl font-semibold text-slate-950">4</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">Leagues</div>
              </div>
              <div className="px-5 py-4">
                <div className="text-2xl font-semibold text-slate-950">DB</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">First</div>
              </div>
            </div>
          </div>

          <HomeHighlights />
        </section>

        <section id="standings" className="imori-card mb-5 scroll-mt-20 overflow-hidden">
          <div className="border-b border-slate-100 px-4 py-3 sm:px-5">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="imori-section-title">Standings</div>
                <h2 className="mt-1 text-xl">{leagueLabel[activeLeague]}排行榜</h2>
              </div>
              {statusInfo && (
                <DataStatus
                  source={statusInfo.source}
                  snapshot={statusInfo.snapshot}
                  generatedAt={statusInfo.generatedAt}
                  compact
                />
              )}
            </div>
            <LeagueTabs active={activeLeague} onChange={setActiveLeague} />
          </div>

          <div className="px-4 py-4 sm:px-5">
            {fetchState === 'loading' && (
              <div className="space-y-2 py-3">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-10 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            )}

            {fetchState === 'error' && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-8 text-center">
                <p className="text-sm font-medium text-rose-700">{loadError || '載入失敗'}</p>
                <button
                  onClick={() => doFetch(activeLeague)}
                  className="mt-3 rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-rose-700 shadow-sm"
                >
                  Retry
                </button>
              </div>
            )}

            {fetchState === 'loaded' && (
              <StandingsTable teams={teams} compact />
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <PlayerSpotlightList />
          <NewsFeedList />
        </section>
      </div>
    </div>
  )
}
