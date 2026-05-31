const TEAM_NAME_ZH: Record<string, string> = {
  // MLB - American League East
  'New York Yankees': '紐約洋基',
  Yankees: '紐約洋基',
  'Boston Red Sox': '波士頓紅襪',
  'Red Sox': '波士頓紅襪',
  'Toronto Blue Jays': '多倫多藍鳥',
  'Blue Jays': '多倫多藍鳥',
  'Baltimore Orioles': '巴爾的摩金鶯',
  Orioles: '巴爾的摩金鶯',
  'Tampa Bay Rays': '坦帕灣光芒',
  Rays: '坦帕灣光芒',

  // MLB - American League Central
  'Cleveland Guardians': '克里夫蘭守護者',
  Guardians: '克里夫蘭守護者',
  'Detroit Tigers': '底特律老虎',
  Tigers: '底特律老虎',
  'Kansas City Royals': '堪薩斯市皇家',
  Royals: '堪薩斯市皇家',
  'Minnesota Twins': '明尼蘇達雙城',
  Twins: '明尼蘇達雙城',
  'Chicago White Sox': '芝加哥白襪',
  'White Sox': '芝加哥白襪',

  // MLB - American League West
  'Houston Astros': '休士頓太空人',
  Astros: '休士頓太空人',
  'Los Angeles Angels': '洛杉磯天使',
  Angels: '洛杉磯天使',
  'Athletics': '運動家',
  'Oakland Athletics': '奧克蘭運動家',
  'Sacramento Athletics': '沙加緬度運動家',
  'Seattle Mariners': '西雅圖水手',
  Mariners: '西雅圖水手',
  'Texas Rangers': '德州遊騎兵',
  Rangers: '德州遊騎兵',

  // MLB - National League East
  'Atlanta Braves': '亞特蘭大勇士',
  Braves: '亞特蘭大勇士',
  'Miami Marlins': '邁阿密馬林魚',
  Marlins: '邁阿密馬林魚',
  'New York Mets': '紐約大都會',
  Mets: '紐約大都會',
  'Philadelphia Phillies': '費城費城人',
  Phillies: '費城費城人',
  'Washington Nationals': '華盛頓國民',
  Nationals: '華盛頓國民',

  // MLB - National League Central
  'Chicago Cubs': '芝加哥小熊',
  Cubs: '芝加哥小熊',
  'Cincinnati Reds': '辛辛那提紅人',
  Reds: '辛辛那提紅人',
  'Milwaukee Brewers': '密爾瓦基釀酒人',
  Brewers: '密爾瓦基釀酒人',
  'Pittsburgh Pirates': '匹茲堡海盜',
  Pirates: '匹茲堡海盜',
  'St. Louis Cardinals': '聖路易紅雀',
  Cardinals: '聖路易紅雀',

  // MLB - National League West
  'Arizona Diamondbacks': '亞利桑那響尾蛇',
  'D-backs': '亞利桑那響尾蛇',
  Diamondbacks: '亞利桑那響尾蛇',
  'Colorado Rockies': '科羅拉多落磯',
  Rockies: '科羅拉多落磯',
  'Los Angeles Dodgers': '洛杉磯道奇',
  Dodgers: '洛杉磯道奇',
  'San Diego Padres': '聖地牙哥教士',
  Padres: '聖地牙哥教士',
  'San Francisco Giants': '舊金山巨人',
  Giants: '舊金山巨人',

  // NPB
  'Hanshin Tigers': '阪神虎',
  阪神: '阪神虎',
  'Tokyo Yakult Swallows': '東京養樂多燕子',
  養樂多: '東京養樂多燕子',
  'Yomiuri Giants': '讀賣巨人',
  巨人: '讀賣巨人',
  'YOKOHAMA DeNA BAYSTARS': '橫濱DeNA海灣之星',
  'YOKOHAMA DeNA': '橫濱DeNA海灣之星',
  DeNA: '橫濱DeNA海灣之星',
  'Hiroshima Toyo Carp': '廣島東洋鯉魚',
  廣島: '廣島東洋鯉魚',
  'Chunichi Dragons': '中日龍',
  中日: '中日龍',
  'ORIX Buffaloes': '歐力士猛牛',
  歐力士: '歐力士猛牛',
  'Saitama Seibu Lions': '埼玉西武獅',
  西武: '埼玉西武獅',
  'Hokkaido Nippon-Ham Fighters': '北海道日本火腿鬥士',
  火腿: '北海道日本火腿鬥士',
  'Fukuoka SoftBank Hawks': '福岡軟銀鷹',
  軟銀: '福岡軟銀鷹',
  'Chiba Lotte Marines': '千葉羅德海洋',
  羅德: '千葉羅德海洋',
  'Tohoku Rakuten Golden Eagles': '東北樂天金鷲',
  樂天: '東北樂天金鷲',


  // NPB short names from npb.jp English schedule
  'Yomiuri': '讀賣巨人',
  'Yakult': '東京養樂多燕子',
  'Hanshin': '阪神虎',
  'Chunichi': '中日龍',
  'Hiroshima': '廣島東洋鯉魚',
  'ORIX': '歐力士猛牛',
  'Orix': '歐力士猛牛',
  'Seibu': '埼玉西武獅',
  'Nippon-Ham': '北海道日本火腿鬥士',
  'SoftBank': '福岡軟銀鷹',
  'Softbank': '福岡軟銀鷹',
  'Lotte': '千葉羅德海洋',
  'Rakuten': '東北樂天金鷲',
  'BayStars': '橫濱DeNA海灣之星',
  'Buffaloes': '歐力士猛牛',
  'Hawks': '福岡軟銀鷹',
  'Marines': '千葉羅德海洋',
  'Fighters': '北海道日本火腿鬥士',
  'Swallows': '東京養樂多燕子',
  'Carp': '廣島東洋鯉魚',
  'Dragons': '中日龍',
  'Eagles': '東北樂天金鷲',
  'Lions': '埼玉西武獅',

  // KBO
  'Kia Tigers': '起亞虎',
  KIA: '起亞虎',
  'Samsung Lions': '三星獅',
  SAMSUNG: '三星獅',
  'LG Twins': 'LG雙子',
  LG: 'LG雙子',
  'Doosan Bears': '斗山熊',
  DOOSAN: '斗山熊',
  'SSG Landers': 'SSG登陸者',
  SSG: 'SSG登陸者',
  'KT Wiz': 'KT巫師',
  KT: 'KT巫師',
  'NC Dinos': 'NC恐龍',
  NC: 'NC恐龍',
  'Lotte Giants': '樂天巨人',
  LOTTE: '樂天巨人',
  'Hanwha Eagles': '韓華鷹',
  HANWHA: '韓華鷹',
  'Kiwoom Heroes': '培證英雄',
  KIWOOM: '培證英雄',

  // CPBL
  'Rakuten Monkeys': '樂天桃猿',
  樂天桃猿: '樂天桃猿',
  'CTBC Brothers': '中信兄弟',
  中信兄弟: '中信兄弟',
  'Uni-President Lions': '統一7-ELEVEn獅',
  統一獅: '統一7-ELEVEn獅',
  'Fubon Guardians': '富邦悍將',
  富邦悍將: '富邦悍將',
  'Wei Chuan Dragons': '味全龍',
  DRAGONS: '味全龍',
  味全龍: '味全龍',
  'TSG Hawks': '台鋼雄鷹',
  台鋼雄鷹: '台鋼雄鷹',
}

export function getTeamDisplayName(raw?: string | null): string {
  const text = String(raw || '').replace(/\s+/g, ' ').trim()
  if (!text) return ''
  if (TEAM_NAME_ZH[text]) return TEAM_NAME_ZH[text]

  const lower = text.toLowerCase()
  const matchedKey = Object.keys(TEAM_NAME_ZH)
    .sort((a, b) => b.length - a.length)
    .find((key) => lower.includes(key.toLowerCase()))

  return matchedKey ? TEAM_NAME_ZH[matchedKey] : text
}
