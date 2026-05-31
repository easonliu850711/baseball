import sys, json, urllib.request, urllib.parse, xml.etree.ElementTree as ET, os, time, subprocess
import email.utils
from datetime import datetime, timezone, timedelta

MAX_DAYS = 30          # 只取 30 天內的新聞（確保每位球員都有新聞）
MAX_PER_PLAYER = 5    # 每人最多取 5 篇

BASE_URL = os.environ.get('BASE_URL', 'http://localhost:4567')
SYNC_TOKEN = os.environ.get('SYNC_TOKEN', '')

if not SYNC_TOKEN:
    print("ERROR: SYNC_TOKEN is not set")
    sys.exit(1)

CUTOFF = datetime.now(timezone.utc) - timedelta(days=MAX_DAYS)

# 格式: (player_id, 中文名, [多組關鍵詞], 英文名(選項))
# 使用 OR 關鍵詞提高搜尋命中率
PLAYERS = [
    ("deng-kai-wei", "鄧愷威", "(鄧愷威 OR Kai-Wei+Teng OR 鄧愷威+先發) 棒球"),
    ("lee-hao-yu", "李灝宇", "(李灝宇 OR Li+Hao-Yu OR 李灝宇+先發) 棒球"),
    ("cheng-tsung-che", "鄭宗哲", "(鄭宗哲 OR Cheng+Tsung-Che OR 鄭宗哲+先發) 棒球"),
    ("chuang-chen-chung-ao", "莊陳仲敖", "(莊陳仲敖 OR Chuang+Chen+Chung-Ao) 棒球"),
    ("lin-yu-min", "林昱珉", "(林昱珉 OR Lin+Yu-Min OR 林昱珉+先發) 棒球"),
    ("chen-po-yu", "陳柏毓", "(陳柏毓 OR Chen+Po-Yu OR 陳柏毓+先發) 棒球"),
    ("liu-chih-jung", "劉致榮", "(劉致榮 OR Liu+Chih-Jung) 棒球"),
    ("chang-hung-leng", "張弘稜", "(張弘稜 OR Chang+Hung-Leng) 棒球"),
    ("lin-wei-en", "林維恩", "(林維恩 OR Lin+Wei-En) 棒球"),
    ("lin-chen-wei", "林振瑋", "(林振瑋 OR Lin+Chen-Wei OR 林振瑋+先發) 棒球"),
    ("pan-wen-hui", "潘文輝", "(潘文輝 OR Pan+Wen-Hui) 棒球"),
    ("lin-sheng-en", "林盛恩", "(林盛恩 OR Lin+Sheng-En) 棒球"),
    ("sha-tzu-chen", "沙子宸", "(沙子宸 OR Sha+Tzu-Chen) 棒球"),
    ("ke-ching-hsien", "柯敬賢", "(柯敬賢 OR Ke+Ching-Hsien) 棒球"),
    ("hsu-ju-hsi", "徐若熙", "(徐若熙 OR Hsu+Ju-Hsi OR 徐若熙+軟銀) 旅日"),
    ("ku-lin-ruei-yang", "古林睿煬", "(古林睿煬 OR Ku+Lin+Ruei-Yang OR 古林睿煬+火腿) 旅日"),
    ("sun-yi-lei", "孫易磊", "(孫易磊 OR Sun+Yi-Lei OR 孫易磊+火腿) 旅日"),
    ("lin-an-ko", "林安可", "(林安可 OR Lin+An-Ko OR 林安可+樂天) 旅日"),
    ("sung-chia-hao", "宋家豪", "(宋家豪 OR Sung+Chia-Hao OR 宋家豪+樂天) 旅日"),
    ("lin-chia-cheng", "林家正", "(林家正 OR Lin+Chia-Cheng OR 林家正+水手) 棒球"),
    ("chang-chun-wei", "張峻瑋", "(張峻瑋 OR Chang+Chun-Wei) 軟銀"),
    ("chen-mu-heng", "陳睦衡", "(陳睦衡 OR Chen+Mu-Heng OR 陳睦衡+歐力士) 棒球"),
    ("hsiao-chi", "蕭齊", "(蕭齊 OR Hsiao+Chi OR 蕭齊+樂天) 棒球"),
    ("hsu-hsiang-sheng", "徐翔聖", "(徐翔聖 OR Hsu+Hsiang-Sheng) 養樂多"),
    ("huang-chin-hao", "黃錦豪", "(黃錦豪 OR Huang+Chin-Hao) 巨人"),
    ("yang-po-hsiang", "陽柏翔", "(陽柏翔 OR Yang+Po-Hsiang) 樂天"),
    ("lin-kuan-chen", "林冠臣", "(林冠臣 OR Lin+Kuan-Chen OR 林冠臣+西武) 棒球"),
    ("wang-yen-cheng", "王彥程", "(王彥程 OR Wang+Yan-Cheng) 樂天"),
]

all_news = []
player_count = 0

for pid, name, kw in PLAYERS:
    player_count += 1
    print(f"{player_count}. {name} ({pid})")
    sys.stdout.flush()

    encoded = urllib.parse.quote(f"{kw}")
    url = f"https://news.google.com/rss/search?q={encoded}&hl=zh-TW&gl=TW&ceid=TW:zh-Hant"

    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        resp = urllib.request.urlopen(req, timeout=10)
        tree = ET.parse(resp)
        root = tree.getroot()
        items = []
        for item in root.findall('.//item'):
            title = item.findtext('title', '')
            link = item.findtext('link', '')
            src_el = item.find('source')
            src = src_el.text.strip() if src_el is not None and src_el.text else ''
            pub = item.findtext('pubDate', '')

            # 日期過濾：只取 7 天內
            if pub:
                try:
                    pub_dt = email.utils.parsedate_to_datetime(pub)
                    if pub_dt < CUTOFF:
                        continue  # 跳過太舊的
                except:
                    pass  # 日期解析失敗則保留

            if title and link:
                if len(items) >= MAX_PER_PLAYER:
                    break
                items.append({
                    'player_id': pid,
                    'title': title.strip(),
                    'url': link.strip(),
                    'source': src.strip() if src else 'Google News',
                    'published_at': pub.strip() if pub else '',
                    'summary': ''
                })
        all_news.extend(items)
        if items:
            print(f"  → {len(items)} articles")
    except Exception as e:
        print(f"  ✗ {e}")

    time.sleep(1)

print(f"\n=== Total news found: {len(all_news)} ===")
print(f"=== Players searched: {player_count} ===")

if not all_news:
    print("No news found, skipping POST")
    sys.exit(0)

# POST
body = json.dumps({"news": all_news}, ensure_ascii=False)
print(f"=== POSTing {len(all_news)} articles to {BASE_URL}/api/sync/news ===")

result = subprocess.run(
    ["curl", "-s", "-X", "POST", f"{BASE_URL}/api/sync/news",
     "-H", "Content-Type: application/json",
     "-H", "Authorization: Bearer " + SYNC_TOKEN,
     "-d", body],
    capture_output=True, text=True, timeout=15
)

print(f"Response: {result.stdout}")
if result.returncode != 0:
    print(f"Stderr: {result.stderr[:200]}")
    sys.exit(1)
