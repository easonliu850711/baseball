/**
 * 球隊中英對照表
 * 統一管理 baseball site 內所有球隊名稱的翻譯
 * 支援 organization（全名）與 team_name（略稱）雙層查詢
 */

const orgMap: Record<string, string> = {
  // ===== MLB 全名 =====
  'San Francisco Giants': '舊金山巨人',
  'Detroit Tigers': '底特律老虎',
  'Pittsburgh Pirates': '匹茲堡海盜',
  'Oakland Athletics': '奧克蘭運動家',
  'Athletics': '奧克蘭運動家',
  'Boston Red Sox': '波士頓紅襪',
  'St. Louis Cardinals': '聖路易紅雀',
  'Arizona Diamondbacks': '亞利桑那響尾蛇',
  'Los Angeles Dodgers': '洛杉磯道奇',
  'Philadelphia Phillies': '費城費城人',
  'Cincinnati Reds': '辛辛那提紅人',

  // ===== NPB 全名 =====
  'Yomiuri Giants': '讀賣巨人',
  'Hanshin Tigers': '阪神虎',
  'Chunichi Dragons': '中日龍',
  'Yokohama DeNA BayStars': '橫濱DeNA海灣之星',
  'Hiroshima Toyo Carp': '廣島東洋鯉魚',
  'Tokyo Yakult Swallows': '東京養樂多燕子',
  'Hokkaido Nippon-Ham Fighters': '北海道日本火腿鬥士',
  'Tohoku Rakuten Golden Eagles': '東北樂天金鷲',
  'Saitama Seibu Lions': '埼玉西武獅',
  'Chiba Lotte Marines': '千葉羅德海洋',
  'Orix Buffaloes': '歐力士猛牛',
  'Fukuoka SoftBank Hawks': '福岡軟銀鷹',
}

const teamMap: Record<string, string> = {
  // ===== MLB 略稱（team_name）=====
  'Giants': '巨人',
  'Tigers': '老虎',
  'Pirates': '海盜',
  'Red Sox': '紅襪',
  'Cardinals': '紅雀',
  'Diamondbacks': '響尾蛇',
  'Dodgers': '道奇',
  'Phillies': '費城人',
  'Reds': '紅人',

  // ===== NPB 略稱（team_name）=====
  'Fighters': '火腿',
  'Golden Eagles': '樂天',
  'Lions': '西武',
  'SoftBank Hawks': '軟銀',
  'Swallows': '養樂多',
  'Buffaloes': '歐力士',
}

/**
 * 取得中文隊名
 * 優先使用 organization（全名）查找，無對應再試 team_name（略稱）
 */
export function getTeamDisplayName(name: string): string {
  return orgMap[name] || teamMap[name] || name
}

export { orgMap, teamMap }
