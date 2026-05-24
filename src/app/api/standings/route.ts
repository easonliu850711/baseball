import { getDb } from '@/lib/db'
import { initSchema } from '@/lib/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const LEAGUE_META: Record<string, { icon: string; title: string }> = {
  NPB_CENTRAL: { icon: '🏔️', title: '央聯 セ・リーグ' },
  NPB_PACIFIC: { icon: '🌊', title: '洋聯 パ・リーグ' },
  CPBL: { icon: '🐉', title: '中華職棒' },
}

// ── NPB 隊名簡稱對照 ──
const NPB_TEAM_SHORT: Record<string, string> = {
  '東京ヤクルトスワローズ': '養樂多',
  '阪神タイガース': '阪神',
  '読売ジャイアンツ': '巨人',
  '横浜DeNAベイスターズ': 'DeNA',
  '広島東洋カープ': '廣島',
  '中日ドラゴンズ': '中日',
  'オリックス・バファローズ': '歐力士',
  '埼玉西武ライオンズ': '西武',
  '北海道日本ハムファイターズ': '火腿',
  '福岡ソフトバンクホークス': '軟銀',
  '千葉ロッテマリーンズ': '羅德',
  '東北楽天ゴールデンイーグルス': '樂天',
}

const NPB_COLORS: Record<string, string> = {
  '養樂多': 'text-green-400', '阪神': 'text-yellow-400', '巨人': 'text-orange-500',
  'DeNA': 'text-blue-400', '廣島': 'text-red-500', '中日': 'text-blue-600',
  '歐力士': 'text-amber-500', '西武': 'text-emerald-400', '火腿': 'text-sky-400',
  '軟銀': 'text-yellow-400', '羅德': 'text-black', '樂天': 'text-red-400',
}

const NPB_STADIUMS: Record<string, string> = {
  '養樂多': '神宮球場', '阪神': '甲子園', '巨人': '東京巨蛋',
  'DeNA': '橫濱球場', '廣島': '馬自達球場', '中日': '名古屋巨蛋',
  '歐力士': '京瓷巨蛋', '西武': '西武巨蛋', '火腿': 'ES CON FIELD',
  '軟銀': 'PayPay巨蛋', '羅德': 'ZOZO海洋球場', '樂天': '樂天移動通信球場',
}

// ── 🕷️ 爬 NPB 官網取得即時戰績 ──
async function scrapeNPB(): Promise<{ central: any[]; pacific: any[] } | null> {
  try {
    const res = await fetch('https://npb.jp/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0' },
      signal: AbortSignal.timeout(10000),
    })
    const html = await res.text()

    // 找出所有表格
    const tables = html.match(/<table>[\s\S]*?<\/table>/g) || []
    if (tables.length < 14) return null

    // Table 0 = 央聯, Table 13 = 洋聯（NPB 首頁固定結構）
    const parseTable = (tableHtml: string) => {
      const rows = tableHtml.match(/<tr>[\s\S]*?<\/tr>/g) || []
      return rows.slice(1).map((row: string, idx: number) => {
        const cells = Array.from(row.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)).map(m => m[1].trim())
        if (cells.length < 7) return null

        // 全名在 span.hide_sp 裡，或直接取純文字（去掉 <br> 前後簡稱）
        const spanMatch = cells[0].match(/<span class="hide_sp">([^<]+)<\/span>/)
        let rawName = spanMatch ? spanMatch[1] : cells[0].replace(/<br\s*\/?>["']?.*$/m, '').replace(/<[^>]+>/g, '').trim()
        // 有些隊名會黏簡稱（例「東京ヤクルトスワローズ東京ヤクルト」→ 取前半）
        const shortName = NPB_TEAM_SHORT[rawName]
        if (!shortName) {
          // 試試用 known keys 比對開頭
          const matched = Object.keys(NPB_TEAM_SHORT).find(k => rawName.startsWith(k))
          if (matched) rawName = matched
        }

        const finalName = NPB_TEAM_SHORT[rawName] || rawName

        return {
          rank: idx + 1,
          team_name: finalName,
          games: parseInt(cells[1]) || 0,
          wins: parseInt(cells[2]) || 0,
          losses: parseInt(cells[3]) || 0,
          draws: parseInt(cells[4]) || 0,
          win_pct: cells[5],
          games_back: cells[6]?.trim() || '-',
          color: NPB_COLORS[finalName] || 'text-gray-400',
          stadium: NPB_STADIUMS[finalName] || '',
        }
      }).filter(Boolean)
    }

    return {
      central: parseTable(tables[0]!),
      pacific: parseTable(tables[13]!),
    }
  } catch {
    return null
  }
}

// ── 硬編碼 Fallback（離線/爬蟲失敗時） ──
const FALLBACK: Record<string, any[]> = require('./fallback.json')

function normalizeTeam(row: any) {
  return {
    rank: row.rank,
    name: row.team_name,
    g: row.games,
    w: row.wins,
    l: row.losses,
    d: row.draws,
    pct: row.win_pct || row.pct,
    gb: row.games_back || row.gb,
    color: row.color || '#',
    stadium: row.stadium || '',
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const league = searchParams.get('league') || ''

  // ── NPB：直接爬官網（即時） ──
  if (league === 'npb') {
    const scraped = await scrapeNPB()
    if (scraped) {
      return Response.json([
        { league: LEAGUE_META.NPB_CENTRAL.title, icon: LEAGUE_META.NPB_CENTRAL.icon, teams: scraped.central.map(normalizeTeam) },
        { league: LEAGUE_META.NPB_PACIFIC.title, icon: LEAGUE_META.NPB_PACIFIC.icon, teams: scraped.pacific.map(normalizeTeam) },
      ])
    }
    // fallback
    return Response.json([
      { league: LEAGUE_META.NPB_CENTRAL.title, icon: LEAGUE_META.NPB_CENTRAL.icon, teams: FALLBACK.NPB_CENTRAL.map(normalizeTeam) },
      { league: LEAGUE_META.NPB_PACIFIC.title, icon: LEAGUE_META.NPB_PACIFIC.icon, teams: FALLBACK.NPB_PACIFIC.map(normalizeTeam) },
    ])
  }

  // ── CPBL：直接爬官網（即時） ──
  if (league === 'cpbl') {
    // 嘗試爬 CPBL 官網
    try {
      const res = await fetch('https://www.cpbl.com.tw/standings/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
        },
        signal: AbortSignal.timeout(8000),
      })
      const html = await res.text()
      const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || []
      if (rows.length > 5) {
        const teams: any[] = []
        for (const rowHtml of rows) {
          const cells = rowHtml.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/g)
          if (!cells || cells.length < 7) continue
          const name = cells[0].replace(/<[^>]+>/g, '').trim()
          if (!name || name === '排名' || name === '球隊') continue
          const vals = cells.slice(1).map(c => c.replace(/<[^>]+>/g, '').trim())
          teams.push({
            rank: teams.length + 1,
            team_name: name,
            games: parseInt(vals[0]) || 0,
            wins: parseInt(vals[1]) || 0,
            losses: parseInt(vals[2]) || 0,
            draws: parseInt(vals[3]) || 0,
            win_pct: vals[4] || '.000',
            games_back: vals[5] || '-',
            color: '',
            stadium: '',
          })
        }
        if (teams.length >= 4) {
          return Response.json([
            { league: LEAGUE_META.CPBL.title, icon: LEAGUE_META.CPBL.icon, teams: teams.map(normalizeTeam) },
          ])
        }
      }
    } catch {}
    return Response.json([
      { league: LEAGUE_META.CPBL.title, icon: LEAGUE_META.CPBL.icon, teams: FALLBACK.CPBL.map(normalizeTeam) },
    ])
  }

  return Response.json([])
}
