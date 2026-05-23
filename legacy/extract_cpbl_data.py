#!/usr/bin/env python3
"""
提取CPBL實際數據
"""

import re
import json
import subprocess
from datetime import datetime

def get_html():
    """獲取CPBL官網HTML"""
    cmd = [
        'curl', '-s', '-L', 'https://www.cpbl.com.tw/standings/season',
        '-H', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        '--max-time', '10'
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')
        if result.returncode == 0:
            return result.stdout
    except:
        pass
    return None

def extract_data(html):
    """從HTML提取數據"""
    if not html:
        return []
    
    teams = []
    
    # 尋找表格行
    # 表格行格式: <tr> ... <td class="sticky"> ... <a href="/team?TeamNo=AAA011">味全龍</a> ... </td> <td class="num">11</td> ...
    rows = re.findall(r'<tr>\s*<td class="sticky">.*?</tr>', html, re.DOTALL)
    
    for row in rows:
        # 提取球隊名稱
        team_match = re.search(r'<a href="/team\?TeamNo=[^"]+">([^<]+)</a>', row)
        if not team_match:
            continue
            
        team_name = team_match.group(1)
        
        # 提取排名
        rank_match = re.search(r'<div class="rank">(\d+)</div>', row)
        rank = rank_match.group(1) if rank_match else "0"
        
        # 提取所有數字數據
        num_matches = re.findall(r'<td class="num">([^<]+)</td>', row)
        
        if len(num_matches) >= 4:
            # 格式: 出賽數, 勝-和-敗, 勝率, 勝差, ...
            games_played = num_matches[0]
            
            # 解析勝-和-敗
            record = num_matches[1]
            record_parts = record.split('-')
            if len(record_parts) == 3:
                wins, ties, losses = record_parts
            else:
                wins, ties, losses = "0", "0", "0"
            
            win_percentage = num_matches[2]
            games_behind = num_matches[3] if len(num_matches) > 3 else "-"
            
            team_data = {
                "rank": rank,
                "team_name": team_name,
                "games_played": games_played,
                "wins": wins,
                "losses": losses,
                "ties": ties,
                "win_percentage": win_percentage,
                "games_behind": games_behind
            }
            
            teams.append(team_data)
            print(f"✅ 提取: {rank}. {team_name} {wins}-{losses}-{ties} 勝率 {win_percentage}")
    
    return teams

def main():
    print("⚾ CPBL實際數據提取")
    print("=" * 60)
    
    html = get_html()
    if not html:
        print("❌ 無法獲取HTML")
        return
    
    teams = extract_data(html)
    
    if len(teams) >= 6:
        print(f"\n✅ 成功提取 {len(teams)} 支球隊數據")
        
        # 保存數據
        data = {
            "timestamp": datetime.now().isoformat(),
            "status": "success",
            "data_available": True,
            "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "standings": {
                "timestamp": datetime.now().isoformat(),
                "source_url": "https://www.cpbl.com.tw/standings/season",
                "date": datetime.now().strftime("%Y-%m-%d"),
                "teams": teams
            },
            "note": "CPBL戰績數據（實際提取版）"
        }
        
        with open("cpbl_actual_data.json", 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"📁 數據已保存到: cpbl_actual_data.json")
        
        # 顯示戰績
        print("\n📊 最新CPBL戰績 (實際數據):")
        for team in teams:
            gb = team['games_behind'] if team['games_behind'] != "-" else "領先"
            print(f"   {team['rank']}. {team['team_name']}: {team['wins']}勝{team['losses']}敗{team['ties']}和，勝率 {team['win_percentage']}，勝差 {gb}")
    else:
        print(f"❌ 只提取到 {len(teams)} 支球隊，數據不完整")

if __name__ == "__main__":
    main()