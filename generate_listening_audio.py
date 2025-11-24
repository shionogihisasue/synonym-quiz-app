"""
Listening Practice Audio Generator
====================================
このスクリプトは、listening_vocabulary.jsonから単語データを読み込み、
Edge TTSを使用してイギリス英語の高品質音声ファイルを生成します。

各単語につき:
- 単語を3回繰り返し読む
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
RATE = "+0%"  # 通常速度（ユーザーがプレイヤーで調整可能）
PITCH = "+0Hz"  # 通常ピッチ
PAUSE_BETWEEN_REPETITIONS = 0.3  # 繰り返しの間の短い間隔（秒）
PAUSE_BETWEEN_SECTIONS = 0.8  # セクション間の間隔（秒）


def create_ssml_text(word_data):
    """
    単語データからSSML形式のテキストを生成
    
    Args:
        word_data: 単語の辞書データ
    
    Returns:
        str: SSML形式のテキスト
    """
    word = word_data['word']
    examples = word_data['examples']
    
    ssml_parts = []
    
    # 単語を3回繰り返し（短い間隔）
    for i in range(3):
        ssml_parts.append(f'<prosody rate="{RATE}" pitch="{PITCH}">{word}</prosody>')
        if i < 2:
            ssml_parts.append(f'<break time="{int(PAUSE_BETWEEN_REPETITIONS * 1000)}ms"/>')
    
    # セクション間の長い間隔
    ssml_parts.append(f'<break time="{int(PAUSE_BETWEEN_SECTIONS * 1000)}ms"/>')
    
    # Daily例文を3回
    for i in range(3):
        ssml_parts.append(f'<prosody rate="{RATE}" pitch="{PITCH}">{examples["daily"]}</prosody>')
        if i < 2:
            ssml_parts.append(f'<break time="{int(PAUSE_BETWEEN_REPETITIONS * 1000)}ms"/>')
    
    ssml_parts.append(f'<break time="{int(PAUSE_BETWEEN_SECTIONS * 1000)}ms"/>')
    
    # Pharmaceutical例文を3回
    for i in range(3):
        ssml_parts.append(f'<prosody rate="{RATE}" pitch="{PITCH}">{examples["pharmaceutical"]}</prosody>')
        if i < 2:
            ssml_parts.append(f'<break time="{int(PAUSE_BETWEEN_REPETITIONS * 1000)}ms"/>')
    
    ssml_parts.append(f'<break time="{int(PAUSE_BETWEEN_SECTIONS * 1000)}ms"/>')
    
    # Data Science例文を3回
    for i in range(3):
        ssml_parts.append(f'<prosody rate="{RATE}" pitch="{PITCH}">{examples["dataScience"]}</prosody>')
        if i < 2:
            ssml_parts.append(f'<break time="{int(PAUSE_BETWEEN_REPETITIONS * 1000)}ms"/>')
    
    # 単語間の間隔
    ssml_parts.append(f'<break time="1500ms"/>')
    
    return ' '.join(ssml_parts)


def create_simple_text(word_data):
    """
    単語データからシンプルなテキストを生成（SSML非対応時用）
    
    Args:
        word_data: 単語の辞書データ
    
    Returns:
        str: プレーンテキスト
    """
    word = word_data['word']
    examples = word_data['examples']
    
    text_parts = []
    
    # 単語を3回
    text_parts.extend([word] * 3)
    
    # 各例文を3回ずつ
    text_parts.extend([examples["daily"]] * 3)
    text_parts.extend([examples["pharmaceutical"]] * 3)
    text_parts.extend([examples["dataScience"]] * 3)
    
    # 各パートをスペースで区切る（自然な間が生まれる）
    return '. '.join(text_parts) + '.'


async def generate_session_audio(session_data, output_file, use_ssml=True):
    """
    1セッション分の音声を生成
    
    Args:
        session_data: セッションの辞書データ
        output_file: 出力ファイルパス
        use_ssml: SSMLを使用するかどうか
    
    Returns:
        bool: 成功したらTrue
    """
    try:
        print(f"\n{'='*60}")
        print(f"🎙️  セッション {session_data['id']}: {session_data['title']}")
        print(f"{'='*60}")
        print(f"単語数: {len(session_data['words'])}語")
        print(f"出力先: {output_file}")
        
        # 全単語のテキストを結合
        if use_ssml:
            # SSML形式で生成
            full_text = '<speak>'
            for idx, word_data in enumerate(session_data['words'], 1):
                print(f"  [{idx}/{len(session_data['words'])}] {word_data['word']} を処理中...")
                full_text += create_ssml_text(word_data)
            full_text += '</speak>'
        else:
            # プレーンテキストで生成
            text_parts = []
            for idx, word_data in enumerate(session_data['words'], 1):
                print(f"  [{idx}/{len(session_data['words'])}] {word_data['word']} を処理中...")
                text_parts.append(create_simple_text(word_data))
            full_text = ' '.join(text_parts)
        
        print(f"\n📝 テキスト長: {len(full_text)} 文字")
        print(f"🔊 音声生成中...")
        
        start_time = time.time()
        
        # Edge TTSで音声生成
        communicate = edge_tts.Communicate(full_text, VOICE)
        await communicate.save(output_file)
        
        elapsed_time = time.time() - start_time
        file_size = os.path.getsize(output_file) / (1024 * 1024)  # MB
        
        print(f"✅ 生成完了!")
        print(f"   ⏱️  所要時間: {elapsed_time:.1f}秒")
        print(f"   📦 ファイルサイズ: {file_size:.2f} MB")
        print(f"   💾 保存先: {output_file}")
        
        return True
        
    except Exception as e:
        print(f"❌ エラー発生: {str(e)}")
        return False


async def generate_all_sessions(json_file, output_dir, retry_failed=True, use_ssml=True):
    """
    全セッションの音声を生成
    
    Args:
        json_file: JSONファイルのパス
        output_dir: 出力ディレクトリ
        retry_failed: 失敗したセッションを再試行するか
        use_ssml: SSMLを使用するかどうか
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
    print(f"🎯 音声生成設定")
    print(f"{'='*60}")
    print(f"音声モデル: {VOICE}")
    print(f"速度: {RATE}")
    print(f"ピッチ: {PITCH}")
    print(f"SSML使用: {'有効' if use_ssml else '無効'}")
    print(f"繰り返しパターン: 単語×3 + 例文×3×3種類 = 12回/単語")
    print(f"{'='*60}\n")
    
    # 統計情報
    total_words = sum(len(session['words']) for session in sessions)
    print(f"📊 合計単語数: {total_words}語")
    print(f"📊 合計繰り返し回数: {total_words * 12}回\n")
    
    # 各セッションの音声生成
    success_count = 0
    failed_sessions = []
    
    overall_start = time.time()
    
    for session in sessions:
        session_id = session['id']
        output_file = output_path / f"session_{session_id}.mp3"
        
        # 既に存在する場合はスキップ（--forceオプションで上書き可能）
        if output_file.exists():
            print(f"\n⚠️  セッション {session_id} の音声ファイルは既に存在します")
            user_input = input(f"   上書きしますか? (y/N): ").strip().lower()
            if user_input != 'y':
                print(f"   ⏭️  スキップしました")
                success_count += 1
                continue
        
        success = await generate_session_audio(session, str(output_file), use_ssml)
        
        if success:
            success_count += 1
        else:
            failed_sessions.append(session_id)
        
        # 次のセッションまで少し待機（APIレート制限対策）
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
            await asyncio.sleep(2)  # 再試行前に少し待機
            
            success = await generate_session_audio(session, str(output_file), use_ssml)
            if success:
                retry_success.append(session_id)
                success_count += 1
        
        # 再試行後も失敗したセッション
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
        if output_file.exists():
            file_size = os.path.getsize(output_file) / (1024 * 1024)
            print(f"   ✅ session_{session['id']}.mp3 ({file_size:.2f} MB)")
        else:
            print(f"   ❌ session_{session['id']}.mp3 (未生成)")


async def test_single_word():
    """
    テスト用: 1単語だけ音声生成
    """
    print("🧪 テストモード: 1単語のみ生成")
    
    test_data = {
        'word': 'Collaborate',
        'examples': {
            'daily': 'Would you like to collaborate on the weekend project for our neighborhood?',
            'pharmaceutical': 'Our research team will collaborate with international partners to accelerate drug development timelines.',
            'dataScience': 'Data scientists collaborate using version control systems to manage shared code repositories.'
        }
    }
    
    text = create_simple_text(test_data)
    print(f"\n生成されるテキスト:\n{text}\n")
    
    output_file = "test_collaborate.mp3"
    
    print(f"🔊 音声生成中...")
    communicate = edge_tts.Communicate(text, VOICE)
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
        description='Listening Practice音声生成スクリプト',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
使用例:
  # 全セッション生成
  python generate_listening_audio.py
  
  # 出力先を指定
  python generate_listening_audio.py -o /path/to/output
  
  # テストモード（1単語のみ）
  python generate_listening_audio.py --test
  
  # SSML無効化（シンプルなテキスト）
  python generate_listening_audio.py --no-ssml
        """
    )
    
    parser.add_argument(
        '-i', '--input',
        default='listening_vocabulary.json',
        help='入力JSONファイルのパス (デフォルト: listening_vocabulary.json)'
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
    
    parser.add_argument(
        '--no-ssml',
        action='store_true',
        help='SSML（間隔調整）を無効化してシンプルなテキストで生成'
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
        retry_failed=not args.no_retry,
        use_ssml=not args.no_ssml
    ))


if __name__ == "__main__":
    print("""
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     🎙️  Listening Practice Audio Generator 🎙️           ║
║                                                           ║
║     イギリス英語ネイティブ発音 (en-GB-SoniaNeural)       ║
║     単語×3 + 例文×3×3種類 = 12回/単語                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    """)
    
    main()