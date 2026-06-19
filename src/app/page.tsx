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

export default function Home() {
  const [activeLeague, setActiveLeague] = useState<LeagueType>('npb')
  const [teams, setTeams] = useState<Team[]>([])
  const [fetchState, setFetchState] = useState<FetchState>('idle')
  const [statusInfo, setStatusInfo] = useState<{ source: string; snapshot: string; generatedAt: string } | null>(null)
  const [mounted, setMounted] = useState(false)
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
      setLoadError(`Standings fetch failed`)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) doFetch(activeLeague)
  }, [mounted, activeLeague, doFetch])

  const handleLeagueChange = (league: LeagueType) => {
    if (league !== activeLeague) {
      setActiveLeague(league)
    }
  }

  const handleRetry = () => {
    doFetch(activeLeague)
  }

  return (
    <div className="bg-ocean-abyss min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-5 sm:py-6">

        {/* ── Today Highlights ── */}
        <HomeHighlights />

        {/* ── League Tabs ── */}
        <div className="mb-0">
          <LeagueTabs active={activeLeague} onChange={handleLeagueChange} />
        </div>

        {/* ── Data Status ── */}
        {statusInfo && (
          <div className="py-1.5">
            <DataStatus
              source={statusInfo.source}
              snapshot={statusInfo.snapshot}
              generatedAt={statusInfo.generatedAt}
              compact
            />
          </div>
        )}

        {/* ── Standings Table ── */}
        <div className="mt-0">
          {fetchState === 'loading' && (
            <div className="py-6">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-8 bg-ocean-mid/10 mb-1 rounded animate-pulse" />
              ))}
            </div>
          )}

          {fetchState === 'error' && (
            <div className="py-8 text-center">
              <p className="text-stone-gray/50 text-sm mb-2">{loadError || '載入失敗'}</p>
              <button
                onClick={handleRetry}
                className="text-[12px] text-ocean-wave/60 hover:text-ocean-wave underline"
              >
                Retry
              </button>
            </div>
          )}

          {fetchState === 'loaded' && (
            <StandingsTable teams={teams} compact />
          )}
        </div>

        {/* ── Divider ── */}
        <div className="my-6 border-t border-white/[0.06]" />

        {/* ── Player Spotlight + News Feed (two columns on desktop) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <PlayerSpotlightList />
          <NewsFeedList />
        </div>

      </div>
    </div>
  )
}
