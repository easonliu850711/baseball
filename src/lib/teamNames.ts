/**
 * 球隊中英對照表
 * 統一管理 baseball site 內所有球隊名稱的翻譯
 */

const teamNameMap: Record<string, string> = {
  // ===== MLB =====
  'Giants': '巨人',
  'Tigers': '老虎',
  'Pirates': '海盜',
  'Athletics': '運動家',
  'Red Sox': '紅襪',
  'Cardinals': '紅雀',
  'Diamondbacks': '響尾蛇',
  'Dodgers': '道奇',
  'Phillies': '費城人',
  'Reds': '紅人',

  // ===== NPB =====
  'Fighters': '火腿',
  'Golden Eagles': '樂天',
  'Lions': '西武',
  'SoftBank Hawks': '軟銀',
  'Swallows': '養樂多',
  'Buffaloes': '歐力士',

  // ===== 全名 → 略稱用 =====
  // organization 欄位對照
  'San Francisco Giants': '巨人',
  'Detroit Tigers': '老虎',
  'Pittsburgh Pirates': '海盜',
  'Philadelphia Phillies': '費城人',
  'Cincinnati Reds': '紅人',
  'St. Louis Cardinals': '紅雀',
  'Los Angeles Dodgers': '道奇',
  'Arizona Diamondbacks': '響尾蛇',
  'Boston Red Sox': '紅襪',
  'Orix Buffaloes': '歐力士',
  'Hokkaido Nippon-Ham Fighters': '火腿',
  'Tohoku Rakuten Golden Eagles': '樂天',
  'Saitama Seibu Lions': '西武',
  'Fukuoka SoftBank Hawks': '軟銀',
  'Tokyo Yakult Swallows': '養樂多',
  'Yomiuri Giants': '巨人',
}

/**
 * 取得中文隊名（找不到時回傳原文）
 */
export function getTeamDisplayName(name: string): string {
  return teamNameMap[name] || name
}

export default teamNameMap
