import sys, json, urllib.request, urllib.parse, xml.etree.ElementTree as ET, os, time, subprocess
import email.utils
from datetime import datetime, timezone, timedelta

MAX_DAYS = 30          # 只取 30 天內的新聞
MAX_PER_PLAYER = 5    # 每人最多取 5 篇
CLEAR_OLD_DAYS = 90   # 同步時砍掉超過 N 天的新聞（汰舊換新）

BASE_URL = os.environ.get('BASE_URL', 'http://localhost:4567')
SYNC_TOKEN = os.environ.get('SYNC_TOKEN', '')

if not SYNC_TOKEN:
    print("ERROR: SYNC_TOKEN is not set")
    sys.exit(1)

CUTOFF = datetime.now(timezone.utc) - timedelta(days=MAX_DAYS)

# 格式: (player_id, 中文名, [多組關鍵詞], 英文名(選項))
# 使用 OR 關鍵詞提高搜尋命中率
PLAYERS = [
    ("deng-kai-wei", "鄧愷威", ["鄧愷威 巨人", "鄧愷威 太空人", "鄧愷威 先發"]),
    ("lee-hao-yu", "李灝宇", ["李灝宇 老虎", "李灝宇 先發", "李灝宇 全壘打"]),
    ("cheng-tsung-che", "鄭宗哲", ["鄭宗哲 海盜", "鄭宗哲 先發"]),
    ("chuang-chen-chung-ao", "莊陳仲敖", ["莊陳仲敖 運動家"]),
    ("lin-yu-min", "林昱珉", ["林昱珉 響尾蛇", "林昱珉 先發"]),
    ("chen-po-yu", "陳柏毓", ["陳柏毓 海盜"]),
    ("liu-chih-jung", "劉致榮", ["劉致榮 紅襪"]),
    ("chang-hung-leng", "張弘稜", ["張弘稜 海盜"]),
    ("lin-wei-en", "林維恩", ["林維恩 運動家"]),
    ("lin-chen-wei", "林振瑋", ["林振瑋 紅雀", "林振瑋 先發"]),
    ("pan-wen-hui", "潘文輝", ["潘文輝 費城人"]),
    ("lin-sheng-en", "林盛恩", ["林盛恩 紅人"]),
    ("sha-tzu-chen", "沙子宸", ["沙子宸 運動家"]),
    ("ke-ching-hsien", "柯敬賢", ["柯敬賢 道奇"]),
    ("hsu-ju-hsi", "徐若熙", ["徐若熙 軟銀", "徐若熙 先發"]),
    ("ku-lin-ruei-yang", "古林睿煬", ["古林睿煬 火腿", "古林睿煬 先發"]),
    ("sun-yi-lei", "孫易磊", ["孫易磊 火腿"]),
    ("lin-an-ko", "林安可", ["林安可 樂天"]),
    ("sung-chia-hao", "宋家豪", ["宋家豪 樂天"]),
    ("lin-chia-cheng", "林家正", ["林家正 水手", "林家正 先發"]),
    ("chang-chun-wei", "張峻瑋", ["張峻瑋 軟銀", "張峻瑋 二軍"]),
    ("chen-mu-heng", "陳睦衡", ["陳睦衡 歐力士"]),
    ("hsiao-chi", "蕭齊", ["蕭齊 樂天", "蕭齊 棒球"]),
    ("hsu-hsiang-sheng", "徐翔聖", ["徐翔聖 養樂多"]),
    ("huang-chin-hao", "黃錦豪", ["黃錦豪 巨人"]),
    ("yang-po-hsiang", "陽柏翔", ["陽柏翔 樂天"]),
    ("lin-kuan-chen", "林冠臣", ["林冠臣 西武"]),
    ("wang-yen-cheng", "王彥程", ["王彥程 樂天"]),
]

all_news = []
player_count = 0

for pid, name, kws in PLAYERS:
    player_count += 1
    print(f"{player_count}. {name} ({pid})")
    sys.stdout.flush()

    items = []

    for kw in kws:
        if len(items) >= MAX_PER_PLAYER:
            break

        encoded = urllib.parse.quote(f"{kw}")
        url = f"https://news.google.com/rss/search?q={encoded}&hl=zh-TW&gl=TW&ceid=TW:zh-Hant"

        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            resp = urllib.request.urlopen(req, timeout=8)
            tree = ET.parse(resp)
            root = tree.getroot()
            for item in root.findall('.//item'):
                if len(items) >= MAX_PER_PLAYER:
                    break
                title = item.findtext('title', '')
                link = item.findtext('link', '')
                if not title or not link:
                    continue
                src_el = item.find('source')
                src = src_el.text.strip() if src_el is not None and src_el.text else ''
                pub = item.findtext('pubDate', '')

                # 日期過濾
                if pub:
                    try:
                        pub_dt = email.utils.parsedate_to_datetime(pub)
                        if pub_dt < CUTOFF:
                            continue
                    except:
                        pass

                items.append({
                    'player_id': pid,
                    'title': title.strip(),
                    'url': link.strip(),
                    'source': src.strip() if src else 'Google News',
                    'published_at': pub.strip() if pub else '',
                    'summary': ''
                })
        except Exception as e:
            pass

        time.sleep(0.5)

    # 去重
    seen = set()
    unique = []
    for item in items:
        key = (item['title'], item['url'][:80])
        if key not in seen:
            seen.add(key)
            unique.append(item)
    final = unique[:MAX_PER_PLAYER]
    all_news.extend(final)
    if final:
        print(f"  → {len(final)} articles")

print(f"\n=== Total news found: {len(all_news)} ===")
print(f"=== Players searched: {player_count} ===")

if not all_news:
    print("No news found, skipping POST")
    sys.exit(0)

# POST — 含汰舊換新參數
payload = {"news": all_news, "clear_old_days": CLEAR_OLD_DAYS}
body = json.dumps(payload, ensure_ascii=False)
print(f"=== POSTing {len(all_news)} articles to {BASE_URL}/api/sync/news (clear_old_days={CLEAR_OLD_DAYS}) ===")

result = subprocess.run(
    ["curl", "-s", "-X", "POST", f"{BASE_URL}/api/sync/news",
     "-H", "Content-Type: application/json",
     "-H", "Authorization: Bearer " + SYNC_TOKEN,
     "-d", body],
    capture_output=True, text=True, timeout=30
)

print(f"Response: {result.stdout}")
if result.returncode != 0:
    print(f"Stderr: {result.stderr[:200]}")
    sys.exit(1)
