"""
Listening Practice Audio Generator V2
======================================
単語 + 同義語 + 3つの例文のみを読み上げます

各単語につき:
- 単語を3回繰り返し読む
- 同義語を1回読む（"Synonyms: cooperate, work together..." の形式）
- Daily例文を3回繰り返し読む
- Pharmaceutical例文を3回繰り返し読む
- Data Science例文を3回繰り返し読む

音声: en-GB-SoniaNeural (イギリス英語女性、高品質)
"""

import edge_tts
import asyncio
import json
import os
from pathlib import Path
import time


# 設定
VOICE = "en-GB-SoniaNeural"  # イギリス英語
RATE = "+0%"  # 通常速度
PITCH = "+0Hz"  # 通常ピッチ


def create_audio_text(word_data):
    """
    単語データから読み上げテキストを生成
    単語 + 同義語 + 例文のみ
    
    Args:
        word_data: 単語の辞書データ
    
    Returns:
        str: 読み上げ用テキスト
    """
    word = word_data['word']
    synonyms = word_data['synonyms']
    examples = word_data['examples']
    
    text_parts = []
    
    # 1. 単語を3回繰り返し
    for i in range(3):
        text_parts.append(word)
    
    # 2. 同義語を読む（リスト形式）
    # 例: "Synonyms: cooperate, work together, partner, team up"
    synonyms_text = "Synonyms: " + ", ".join(synonyms)
    text_parts.append(synonyms_text)
    
    # 3. Daily例文を3回
    for i in range(3):
        text_parts.append(examples["daily"])
    
    # 4. Pharmaceutical例文を3回
    for i in range(3):
        text_parts.append(examples["pharmaceutical"])
    
    # 5. Data Science例文を3回
    for i in range(3):
        text_parts.append(examples["dataScience"])
    
    # 各パートを「。」で区切る（自然な間が生まれる）
    return ". ".join(text_parts) + ". "


async def generate_session_audio_with_timestamps(session_data, output_file):
    """
    1セッション分の音声を生成（タイムスタンプ付き）
    
    Args:
        session_data: セッションの辞書データ
        output_file: 出力ファイルパス
    
    Returns:
        dict: タイムスタンプ情報
    """
    try:
        print(f"\n{'='*60}")
        print(f"🎙️  セッション {session_data['id']}: {session_data['title']}")
        print(f"{'='*60}")
        print(f"単語数: {len(session_data['words'])}語")
        print(f"出力先: {output_file}")
        
        # 全単語のテキストを結合 & タイムスタンプ情報を記録
        full_text_parts = []
        timestamps_data = []
        
        estimated_time = 0  # 推定時間（秒）
        
        for idx, word_data in enumerate(session_data['words'], 1):
            print(f"  [{idx}/{len(session_data['words'])}] {word_data['word']} を処理中...")
            
            word = word_data['word']
            synonyms = word_data['synonyms']
            examples = word_data['examples']
            
            # このセクションの開始時間
            word_start_time = estimated_time
            
            # テキスト生成
            word_text = create_audio_text(word_data)
            full_text_parts.append(word_text)
            
            # タイムスタンプ推定（文字数ベース）
            # 平均的な読み上げ速度: 約3文字/秒（英語）
            word_duration = len(word_text) / 3.0
            
            # タイムスタンプ情報を保存
            timestamps_data.append({
                "word": word,
                "synonyms": ", ".join(synonyms),
                "daily": examples["daily"],
                "pharmaceutical": examples["pharmaceutical"],
                "dataScience": examples["dataScience"],
                "startTime": round(word_start_time, 2),
                "endTime": round(estimated_time + word_duration, 2),
                "duration": round(word_duration, 2)
            })
            
            estimated_time += word_duration
        
        full_text = " ".join(full_text_parts)
        
        print(f"\n📝 テキスト長: {len(full_text)} 文字")
        print(f"⏱️  推定再生時間: {estimated_time/60:.1f}分")
        print(f"🔊 音声生成中...")
        
        start_time = time.time()
        
        # Edge TTSで音声生成
        communicate = edge_tts.Communicate(full_text, VOICE, rate=RATE, pitch=PITCH)
        await communicate.save(output_file)
        
        elapsed_time = time.time() - start_time
        file_size = os.path.getsize(output_file) / (1024 * 1024)  # MB
        
        print(f"✅ 生成完了!")
        print(f"   ⏱️  所要時間: {elapsed_time:.1f}秒")
        print(f"   📦 ファイルサイズ: {file_size:.2f} MB")
        print(f"   💾 保存先: {output_file}")
        
        # タイムスタンプJSONを保存
        timestamp_file = output_file.replace('.mp3', '_timestamps.json')
        with open(timestamp_file, 'w', encoding='utf-8') as f:
            json.dump(timestamps_data, f, indent=2, ensure_ascii=False)
        
        print(f"   📋 タイムスタンプ: {timestamp_file}")
        
        return timestamps_data
        
    except Exception as e:
        print(f"❌ エラー発生: {str(e)}")
        return None


async def generate_all_sessions(json_file, output_dir, retry_failed=True):
    """
    全セッションの音声を生成
    
    Args:
        json_file: JSONファイルのパス
        output_dir: 出力ディレクトリ
        retry_failed: 失敗したセッションを再試行するか
    """
    # JSONファイル読み込み
    print(f"📖 JSONファイル読み込み中: {json_file}")
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    sessions = data['sessions']
    print(f"✅ {len(sessions)}セッション見つかりました")
    
    # 出力ディレクトリ作成
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    print(f"📁 出力ディレクトリ: {output_path.absolute()}")
    
    # メタデータ表示
    print(f"\n{'='*60}")
    print(f"🎯 音声生成設定 V2")
    print(f"{'='*60}")
    print(f"音声モデル: {VOICE}")
    print(f"速度: {RATE}")
    print(f"ピッチ: {PITCH}")
    print(f"読み上げ内容: 単語×3 + 同義語×1 + 例文×3×3種類")
    print(f"字幕対応: タイムスタンプJSON出力")
    print(f"{'='*60}\n")
    
    # 統計情報
    total_words = sum(len(session['words']) for session in sessions)
    print(f"📊 合計単語数: {total_words}語\n")
    
    # 各セッションの音声生成
    success_count = 0
    failed_sessions = []
    
    overall_start = time.time()
    
    for session in sessions:
        session_id = session['id']
        output_file = output_path / f"session_{session_id}.mp3"
        
        # 既に存在する場合は確認
        if output_file.exists():
            print(f"\n⚠️  セッション {session_id} の音声ファイルは既に存在します")
            user_input = input(f"   上書きしますか? (y/N): ").strip().lower()
            if user_input != 'y':
                print(f"   ⏭️  スキップしました")
                success_count += 1
                continue
        
        timestamps = await generate_session_audio_with_timestamps(session, str(output_file))
        
        if timestamps:
            success_count += 1
        else:
            failed_sessions.append(session_id)
        
        # 次のセッションまで少し待機
        if session_id < len(sessions):
            await asyncio.sleep(1)
    
    # リトライ処理
    if retry_failed and failed_sessions:
        print(f"\n{'='*60}")
        print(f"🔄 失敗したセッションを再試行します...")
        print(f"{'='*60}")
        
        retry_success = []
        for session_id in failed_sessions:
            session = next(s for s in sessions if s['id'] == session_id)
            output_file = output_path / f"session_{session_id}.mp3"
            
            print(f"\n🔄 セッション {session_id} を再試行中...")
            await asyncio.sleep(2)
            
            timestamps = await generate_session_audio_with_timestamps(session, str(output_file))
            if timestamps:
                retry_success.append(session_id)
                success_count += 1
        
        failed_sessions = [sid for sid in failed_sessions if sid not in retry_success]
    
    overall_elapsed = time.time() - overall_start
    
    # 最終結果
    print(f"\n{'='*60}")
    print(f"🎉 音声生成完了!")
    print(f"{'='*60}")
    print(f"✅ 成功: {success_count}/{len(sessions)} セッション")
    if failed_sessions:
        print(f"❌ 失敗: {len(failed_sessions)} セッション")
        print(f"   失敗したセッション: {', '.join(map(str, failed_sessions))}")
    print(f"⏱️  合計所要時間: {overall_elapsed/60:.1f}分")
    print(f"📁 出力先: {output_path.absolute()}")
    print(f"{'='*60}\n")
    
    # 生成されたファイル一覧
    print("📂 生成されたファイル:")
    for session in sessions:
        output_file = output_path / f"session_{session['id']}.mp3"
        timestamp_file = output_path / f"session_{session['id']}_timestamps.json"
        if output_file.exists():
            file_size = os.path.getsize(output_file) / (1024 * 1024)
            print(f"   ✅ session_{session['id']}.mp3 ({file_size:.2f} MB)")
            if timestamp_file.exists():
                print(f"      📋 + timestamps JSON (字幕用)")
        else:
            print(f"   ❌ session_{session['id']}.mp3 (未生成)")


async def test_single_word():
    """
    テスト用: 1単語だけ音声生成
    """
    print("🧪 テストモード: 1単語のみ生成")
    
    test_data = {
        'word': 'Collaborate',
        'synonyms': ['cooperate', 'work together', 'partner', 'team up'],
        'examples': {
            'daily': 'Would you like to collaborate on the weekend project for our neighborhood?',
            'pharmaceutical': 'Our research team will collaborate with international partners to accelerate drug development timelines.',
            'dataScience': 'Data scientists collaborate using version control systems to manage shared code repositories.'
        }
    }
    
    text = create_audio_text(test_data)
    print(f"\n生成されるテキスト:\n{text}\n")
    
    output_file = "test_collaborate_v2.mp3"
    
    print(f"🔊 音声生成中...")
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
    await communicate.save(output_file)
    
    file_size = os.path.getsize(output_file) / 1024  # KB
    print(f"✅ テスト完了!")
    print(f"   📦 ファイルサイズ: {file_size:.2f} KB")
    print(f"   💾 保存先: {output_file}")
    print(f"\n再生して確認してください: {output_file}")


def main():
    """
    メイン関数
    """
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Listening Practice音声生成スクリプト V2 (字幕対応)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
使用例:
  # 全セッション生成
  python generate_listening_audio_v2.py
  
  # 出力先を指定
  python generate_listening_audio_v2.py -o assets/audio/listening
  
  # テストモード（1単語のみ）
  python generate_listening_audio_v2.py --test
        """
    )
    
    parser.add_argument(
        '-i', '--input',
        default='data/listening_vocabulary.json',
        help='入力JSONファイルのパス (デフォルト: data/listening_vocabulary.json)'
    )
    
    parser.add_argument(
        '-o', '--output',
        default='assets/audio/listening',
        help='出力ディレクトリのパス (デフォルト: assets/audio/listening)'
    )
    
    parser.add_argument(
        '--test',
        action='store_true',
        help='テストモード: 1単語だけ生成'
    )
    
    parser.add_argument(
        '--no-retry',
        action='store_true',
        help='失敗したセッションの再試行を無効化'
    )
    
    args = parser.parse_args()
    
    # テストモード
    if args.test:
        asyncio.run(test_single_word())
        return
    
    # 入力ファイルチェック
    if not os.path.exists(args.input):
        print(f"❌ エラー: JSONファイルが見つかりません: {args.input}")
        print(f"   カレントディレクトリ: {os.getcwd()}")
        return
    
    # 音声生成実行
    asyncio.run(generate_all_sessions(
        args.input,
        args.output,
        retry_failed=not args.no_retry
    ))


if __name__ == "__main__":
    print("""
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     🎙️  Listening Practice Audio Generator V2 🎙️        ║
║                                                           ║
║     イギリス英語ネイティブ発音 (en-GB-SoniaNeural)       ║
║     単語×3 + 同義語×1 + 例文×3×3種類                   ║
║     字幕対応: タイムスタンプJSON出力                     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    """)
    
    main()