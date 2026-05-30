export type LeagueKey = 'npb' | 'cpbl' | 'mlb' | 'kbo'

export type LeagueInfo = {
  key: LeagueKey
  label: string
  short: string
  flag: string
  country: string
  source: string
  accent: string
  description: string
}

export type TeamStanding = {
  rank: number
  name: string
  g: number
  w: number
  l: number
  d: number
  pct: string
  gb: string
  color?: string
  stadium?: string
  streak?: string
}

export type LeagueBlock = {
  league: string
  icon: string
  source?: string
  updatedAt?: string
  teams: TeamStanding[]
}

export type GamePreview = {
  id: string
  league: string
  season: number
  game_date: string
  game_time: string
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  stadium: string
  status: 'scheduled' | 'finished' | 'live' | 'postponed' | 'tour'
  note?: string
}

export type OverseasPlayer = {
  player_id: string
  name_zh: string
  name_en: string
  country: 'US' | 'JP' | 'KR'
  league: string
  organization: string
  team_name: string
  current_level: string
  roster_status: string
  position: string
  bats_throws: string
  confidence: 'high' | 'medium' | 'low'
  needs_review?: boolean
  update_note: string
  watch_reason: string
}

export type StadiumTourStop = {
  name: string
  team: string
  date: string
  watched: boolean
  bought: boolean
  price: number
  note: string
  region: string
  color: string
}

export type WatchLog = {
  date: string
  opponent: string
  stadium: string
  highlight: string
  mood: string
  tags: string[]
}

export const LEAGUES: LeagueInfo[] = [
  {
    key: 'npb',
    label: '日本 NPB',
    short: 'NPB',
    flag: '🇯🇵',
    country: '日本',
    source: 'NPB 官方英文 B.I.S.',
    accent: 'from-sky-400 to-cyan-300',
    description: '央聯 / 洋聯戰績、你的 2026 主場巡禮主線。',
  },
  {
    key: 'cpbl',
    label: '台灣 CPBL',
    short: 'CPBL',
    flag: '🇹🇼',
    country: '台灣',
    source: '你的 CPBL cron + sync API',
    accent: 'from-emerald-400 to-lime-300',
    description: '每天自動同步戰績，作為 Nosae 推送基礎。',
  },
  {
    key: 'mlb',
    label: '美國 MLB',
    short: 'MLB',
    flag: '🇺🇸',
    country: '美國',
    source: 'MLB Stats API / 官方 standings',
    accent: 'from-rose-400 to-red-300',
    description: '美聯 / 國聯六分區，重點看旅美球員所屬體系。',
  },
  {
    key: 'kbo',
    label: '韓國 KBO',
    short: 'KBO',
    flag: '🇰🇷',
    country: '韓國',
    source: 'KBO 英文官網',
    accent: 'from-violet-400 to-fuchsia-300',
    description: '十隊單一聯盟，適合快速對照亞洲戰力。',
  },
]

export const KBO_TEAM_ZH: Record<string, string> = {
  SAMSUNG: '三星獅',
  LG: 'LG雙子',
  KT: 'KT巫師',
  KIA: '起亞虎',
  HANWHA: '韓華鷹',
  DOOSAN: '斗山熊',
  SSG: 'SSG登陸者',
  LOTTE: '樂天巨人',
  NC: 'NC恐龍',
  KIWOOM: '培證英雄',
}

export const KBO_COLORS: Record<string, string> = {
  SAMSUNG: 'text-blue-400',
  '三星獅': 'text-blue-400',
  LG: 'text-red-400',
  'LG雙子': 'text-red-400',
  KT: 'text-orange-400',
  'KT巫師': 'text-orange-400',
  KIA: 'text-red-500',
  '起亞虎': 'text-red-500',
  HANWHA: 'text-orange-500',
  '韓華鷹': 'text-orange-500',
  DOOSAN: 'text-indigo-400',
  '斗山熊': 'text-indigo-400',
  SSG: 'text-yellow-400',
  'SSG登陸者': 'text-yellow-400',
  LOTTE: 'text-pink-400',
  '樂天巨人': 'text-pink-400',
  NC: 'text-blue-300',
  'NC恐龍': 'text-blue-300',
  KIWOOM: 'text-red-300',
  '培證英雄': 'text-red-300',
}

export const CPBL_COLORS: Record<string, string> = {
  味全龍: 'text-red-500',
  富邦悍將: 'text-blue-500',
  統一獅: 'text-orange-500',
  台鋼雄鷹: 'text-emerald-400',
  樂天桃猿: 'text-red-400',
  中信兄弟: 'text-yellow-400',
}

export const CPBL_STADIUMS: Record<string, string> = {
  味全龍: '天母 / 大巨蛋',
  富邦悍將: '新莊棒球場',
  統一獅: '台南棒球場',
  台鋼雄鷹: '澄清湖棒球場',
  樂天桃猿: '樂天桃園棒球場',
  中信兄弟: '洲際棒球場',
}

export const STADIUM_TOUR: StadiumTourStop[] = [
  { name: 'ES CON FIELD 北海道', team: '日本火腿', date: '2026-06-12', watched: false, bought: true, price: 7313, region: '北海道', note: 'Peach航空 北海道遠征開幕 🔥', color: 'from-sky-400 to-blue-600' },
  { name: '楽天モバイルパーク', team: '樂天金鷹', date: '2026-06-14', watched: false, bought: true, price: 7165, region: '東北', note: '夜巴從札幌殺到仙台！東西縱走', color: 'from-red-500 to-rose-700' },
  { name: 'ZOZOマリンスタジアム', team: '羅德海洋', date: '2026-06-21', watched: false, bought: true, price: 7020, region: '關東', note: '千葉海邊的棒球 × 炸雞啤酒 🍗🍺', color: 'from-black to-gray-800' },
  { name: 'ベルーナドーム', team: '西武獅', date: '2026-06-28', watched: false, bought: true, price: 6040, region: '關東', note: '黃金週場勘後的正式巡禮 ✅', color: 'from-emerald-500 to-green-700' },
  { name: '横浜スタジアム', team: 'DeNA 海星 vs 中日', date: '2026-07-07', watched: false, bought: true, price: 3960, region: '關東', note: '七夕在横浜！中日戦 🌟', color: 'from-blue-500 to-cyan-600' },
  { name: '富山 オールスター', team: '明星賽 ⭐', date: '2026-07-29', watched: false, bought: false, price: 0, region: '北陸', note: 'オールスター！夢の競演', color: 'from-yellow-400 to-amber-600' },
  { name: '神宮球場', team: '養樂多燕子', date: '2026-08-02', watched: false, bought: false, price: 0, region: '東京', note: '6/19(金) 11:00 搶票', color: 'from-green-400 to-emerald-600' },
  { name: '東京ドーム', team: '讀賣巨人', date: '2026-08-02', watched: false, bought: false, price: 0, region: '東京', note: '6/20(土) 11:00 搶票', color: 'from-orange-400 to-red-600' },
  { name: 'バンテリンドーム', team: '中日龍', date: '2026-08-11', watched: false, bought: false, price: 0, region: '名古屋', note: '6/3(水) 11:00 搶票 📌', color: 'from-blue-400 to-indigo-600' },
  { name: 'MAZDA Zoom-Zoom', team: '廣島鯉魚', date: '2026-09-05', watched: false, bought: true, price: 3520, region: '中國', note: '廣島名物・牡蠣と野球！🦪', color: 'from-red-400 to-rose-600' },
  { name: 'PayPay巨蛋', team: '軟銀鷹', date: '2026-09-06', watched: false, bought: false, price: 0, region: '九州', note: '6/7〜 搶票', color: 'from-yellow-400 to-amber-600' },
  { name: '甲子園球場', team: '阪神虎 vs 広島', date: '2026-09-09', watched: false, bought: true, price: 9986, region: '關西', note: '聖地再臨！阪神×広島 🐯', color: 'from-yellow-500 to-amber-700' },
  { name: 'ほっと神戸', team: '歐力士猛牛 vs 西武', date: '2026-09-10', watched: false, bought: false, price: 0, region: '關西', note: '7/22(水) 京セラD一起搶', color: 'from-amber-500 to-orange-700' },
  { name: '京セラドーム大阪', team: '歐力士猛牛 vs 樂天', date: '2026-09-12', watched: false, bought: false, price: 0, region: '關西', note: '7/22(水) 一起搶！關西收尾戰', color: 'from-amber-500 to-orange-700' },
]

export const WATCH_LOG: WatchLog[] = [
  { date: '2026-04-01', opponent: '東北楽天 vs 福岡軟銀', stadium: '楽天モバイルパーク', highlight: '單日來回仙台，若熙日本初先發，6局無失分好投', mood: '🔥', tags: ['NPB', '旅外', '仙台'] },
  { date: '2026-05-03', opponent: '千葉羅德 vs 西武獅', stadium: 'ZOZOマリン', highlight: '換來看溫安可，代打上陣（雖然沒敲安）', mood: '🎉', tags: ['NPB', '台將', '千葉'] },
  { date: '2025-09-13', opponent: '台鋼 vs 富邦', stadium: '澄清湖棒球場', highlight: '終於見到超美一粒', mood: '💖', tags: ['CPBL', '澄清湖'] },
  { date: '2024-11-24', opponent: '台灣 vs 日本 4:0', stadium: '東京ドーム', highlight: '炸裂東蛋，史上最屌比賽之一，賽後哭爆 Taiwan No.1', mood: '🏆', tags: ['國際賽', '東京巨蛋', '冠軍'] },
]

export const OVERSEAS_PLAYERS: OverseasPlayer[] = [
  { player_id: 'cheng-tsung-che', name_zh: '鄭宗哲', name_en: 'Tsung-Che Cheng', country: 'US', league: 'MLB/MiLB', organization: 'Tampa Bay Rays', team_name: 'Rays system', current_level: '40-man / MiLB', roster_status: '重點觀察', position: 'INF', bats_throws: 'L/R', confidence: 'medium', needs_review: true, update_note: '曾有大聯盟經驗，狀態建議用每日 roster / transaction 校正。', watch_reason: '台灣旅美野手代表，適合放在每日近況第一排。' },
  { player_id: 'lee-hao-yu', name_zh: '李灝宇', name_en: 'Hao-Yu Lee', country: 'US', league: 'MiLB', organization: 'Detroit Tigers', team_name: 'Tigers system', current_level: '高階小聯盟', roster_status: '重點農場', position: 'INF', bats_throws: 'R/R', confidence: 'medium', needs_review: true, update_note: '火力與升階狀態需透過 MiLB/球團資料同步。', watch_reason: '旅美打者天花板高，適合做週報。' },
  { player_id: 'lin-yu-min', name_zh: '林昱珉', name_en: 'Yu-Min Lin', country: 'US', league: 'MiLB', organization: 'Arizona Diamondbacks', team_name: 'D-backs system', current_level: '高階小聯盟', roster_status: '先發左投追蹤', position: 'LHP', bats_throws: 'L/L', confidence: 'medium', needs_review: true, update_note: '先發輪值、局數與三振保送比是主追蹤欄位。', watch_reason: '國際賽關鍵左投，適合做先發日提醒。' },
  { player_id: 'teng-kai-wei', name_zh: '鄧愷威', name_en: 'Kai-Wei Teng', country: 'US', league: 'MLB/MiLB', organization: 'San Francisco Giants', team_name: 'Giants system', current_level: 'MLB/MiLB', roster_status: '投手調度觀察', position: 'RHP', bats_throws: 'R/R', confidence: 'medium', needs_review: true, update_note: '升降與牛棚定位變動快，需要自動抓 transaction。', watch_reason: '若登板可直接推送 Nosae。' },
  { player_id: 'gu-lin-ruei-yang', name_zh: '古林睿煬', name_en: 'Gu Lin Ruei-yang', country: 'JP', league: 'NPB', organization: '北海道日本火腿', team_name: 'Fighters', current_level: '1軍追蹤', roster_status: '先發投手', position: 'RHP', bats_throws: 'R/R', confidence: 'medium', needs_review: true, update_note: '日職先發日、投球局數與用球數是主追蹤欄位。', watch_reason: '你的北海道巡禮核心人物之一。' },
  { player_id: 'hsu-jo-hsi', name_zh: '徐若熙', name_en: 'Hsu Jo-hsi', country: 'JP', league: 'NPB', organization: '福岡軟銀', team_name: 'Hawks', current_level: '1軍追蹤', roster_status: '先發投手', position: 'RHP', bats_throws: 'R/R', confidence: 'medium', needs_review: true, update_note: '先發間隔與傷勢管理要特別注意。', watch_reason: '你已經有現場觀戰紀錄，適合連動紀錄簿。' },
  { player_id: 'lin-an-ko', name_zh: '林安可', name_en: 'Lin An-ko', country: 'JP', league: 'NPB', organization: '埼玉西武', team_name: 'Lions', current_level: '1軍/2軍追蹤', roster_status: '野手調整', position: 'OF', bats_throws: 'L/L', confidence: 'low', needs_review: true, update_note: '一二軍狀態變動需人工或 crawler 校正。', watch_reason: '你已看過一次代打，適合建立個人觀戰時間線。' },
  { player_id: 'sung-chia-hao', name_zh: '宋家豪', name_en: 'Sung Chia-hao', country: 'JP', league: 'NPB', organization: '東北樂天', team_name: 'Golden Eagles', current_level: '1軍/2軍追蹤', roster_status: '牛棚投手', position: 'RHP', bats_throws: 'R/R', confidence: 'medium', needs_review: true, update_note: '登板頻率與中繼狀態適合用短訊息推送。', watch_reason: '東北樂天主場巡禮可順手追蹤。' },
]

export const FALLBACK_GAMES: GamePreview[] = [
  ...STADIUM_TOUR.map((s, idx) => ({
    id: `tour-${idx + 1}`,
    league: 'NPB',
    season: 2026,
    game_date: s.date,
    game_time: '未定',
    home_team: s.team,
    away_team: '主場巡禮',
    home_score: null,
    away_score: null,
    stadium: s.name,
    status: 'tour' as const,
    note: s.note,
  })),
  { id: 'sample-cpbl-1', league: 'CPBL', season: 2026, game_date: '2026-06-01', game_time: '18:35', home_team: '待同步主隊', away_team: '待同步客隊', home_score: null, away_score: null, stadium: 'CPBL 官方賽程同步後顯示', status: 'scheduled', note: '目前以 cron 寫入 DB 為準。' },
  { id: 'sample-mlb-1', league: 'MLB', season: 2026, game_date: '2026-06-01', game_time: 'JST 早上', home_team: 'MLB schedule API', away_team: '待串接', home_score: null, away_score: null, stadium: 'MLB', status: 'scheduled', note: 'MLB 建議用 Stats API schedule endpoint。' },
  { id: 'sample-kbo-1', league: 'KBO', season: 2026, game_date: '2026-06-01', game_time: '18:30', home_team: 'KBO schedule', away_team: '待串接', home_score: null, away_score: null, stadium: 'KBO 官方賽程同步後顯示', status: 'scheduled', note: 'KBO 先完成 standings，賽程 crawler 可下一步接。' },
]
