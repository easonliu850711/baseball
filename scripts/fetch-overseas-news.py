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

PLAYERS = [
    ("deng-kai-wei", "鄧愷威", "鄧愷威 巨人 旅美"),
    ("lee-hao-yu", "李灝宇", "李灝宇 旅美 棒球"),
    ("cheng-tsung-che", "鄭宗哲", "鄭宗哲 旅美 海盜"),
    ("chuang-chen-chung-ao", "莊陳仲敖", "莊陳仲敖 旅美 運動家"),
    ("lin-yu-min", "林昱珉", "林昱珉 響尾蛇 旅美"),
    ("chen-po-yu", "陳柏毓", "陳柏毓 海盜 旅美"),
    ("liu-chih-jung", "劉致榮", "劉致榮 紅襪 旅美"),
    ("chang-hung-leng", "張弘稜", "張弘稜 海盜 旅美"),
    ("lin-wei-en", "林維恩", "林維恩 運動家 旅美"),
    ("lin-chen-wei", "林振瑋", "林振瑋 紅雀 旅美"),
    ("pan-wen-hui", "潘文輝", "潘文輝 費城人 旅美"),
    ("lin-sheng-en", "林盛恩", "林盛恩 紅人 旅美"),
    ("sha-tzu-chen", "沙子宸", "沙子宸 運動家 旅美"),
    ("ke-ching-hsien", "柯敬賢", "柯敬賢 道奇 旅美"),
    ("hsu-ju-hsi", "徐若熙", "徐若熙 軟銀 旅日"),
    ("ku-lin-ruei-yang", "古林睿煬", "古林睿煬 火腿 旅日"),
    ("sun-yi-lei", "孫易磊", "孫易磊 火腿 旅日"),
    ("lin-an-ko", "林安可", "林安可 樂天 旅日"),
    ("sung-chia-hao", "宋家豪", "宋家豪 樂天 旅日"),
    ("lin-chia-cheng", "林家正", "林家正 水手 旅美"),
    ("chang-chun-wei", "張峻瑋", "張峻瑋 軟銀 旅日"),
    ("chen-mu-heng", "陳睦衡", "陳睦衡 歐力士 旅日"),
    ("hsiao-chi", "蕭齊", "蕭齊 樂天 旅日"),
    ("hsu-hsiang-sheng", "徐翔聖", "徐翔聖 養樂多 旅日"),
    ("huang-chin-hao", "黃錦豪", "黃錦豪 巨人 旅日"),
    ("yang-po-hsiang", "陽柏翔", "陽柏翔 樂天 旅日"),
    ("lin-kuan-chen", "林冠臣", "林冠臣 西武 旅日"),
    ("wang-yen-cheng", "王彥程", "王彥程 樂天 旅日"),
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
