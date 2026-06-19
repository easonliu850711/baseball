'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import StandingsTable, { fetchStandings, type Team, type LeagueType } from '@/components/StandingsTable'
import LeagueTabs from '@/components/LeagueTabs'
import DataStatus from '@/components/DataStatus'

export default function StandingsPage() {
  const [activeLeague, setActiveLeague] = useState<LeagueType>('npb')
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchStandings(activeLeague)
      .then((data) => {
        setTeams(data)
        setLoading(false)
      })
      .catch(() => {
        setTeams([])
        setLoading(false)
      })
  }, [activeLeague])

  return (
    <div className="min-h-screen bg-ocean-abyss py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-stone-gray hover:text-shell-white transition-colors mb-8 text-sm"
        >
          ← 回首頁
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-shell-white sm:text-4xl">聯盟戰績</h1>
          <p className="mt-2 text-sm text-stone-gray/50">NPB · CPBL · MLB · KBO 即時排名</p>
        </div>

        <div className="mb-6">
          <LeagueTabs active={activeLeague} onChange={setActiveLeague} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-ocean-wave border-t-transparent" />
          </div>
        ) : (
          <div className="rounded-xl border border-ocean-light/10 bg-ocean-mid/20 p-4 sm:p-6">
            <StandingsTable teams={teams} compact={false} />
          </div>
        )}
      </div>
    </div>
  )
}
