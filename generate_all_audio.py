import edge_tts
import asyncio
import json
import os
import time

async def generate_audio_with_retry(question, voice, max_retries=3):
    """リトライ機能付き音声生成"""
    text = question['question']
    question_id = question['id']
    filename = f"assets/audio/word_{question_id}.mp3"
    
    for attempt in range(max_retries):
        try:
            communicate = edge_tts.Communicate(text, voice)
            await communicate.save(filename)
            return True, None
        except Exception as e:
            if attempt < max_retries - 1:
                wait_time = (attempt + 1) * 2  # 2秒、4秒、6秒と待機時間を増やす
                print(f"  ⚠️  Retry {attempt + 1}/{max_retries} after {wait_time}s...")
                await asyncio.sleep(wait_time)
            else:
                return False, str(e)
    
    return False, "Max retries reached"

async def generate_audio():
    print("=" * 70)
    print("🎤 High-Quality Audio Generation with Edge TTS")
    print("=" * 70)
    
    # questions.jsonを読み込み
    try:
        with open('data/questions.json', 'r', encoding='utf-8') as f:
            questions = json.load(f)
        print(f"✓ Loaded {len(questions)} questions")
    except Exception as e:
        print(f"✗ Error loading questions.json: {e}")
        return
    
    # assets/audioフォルダが存在するか確認
    audio_dir = 'assets/audio'
    if not os.path.exists(audio_dir):
        os.makedirs(audio_dir)
        print(f"✓ Created directory: {audio_dir}")
    
    # 既存のファイルを確認
    existing_files = set()
    for file in os.listdir(audio_dir):
        if file.startswith('word_') and file.endswith('.mp3'):
            existing_files.add(file)
    
    if existing_files:
        print(f"✓ Found {len(existing_files)} existing audio files")
        choice = input("Skip existing files? (y/n): ").strip().lower()
        skip_existing = choice == 'y'
    else:
        skip_existing = False
    
    # 音声設定
    voice = "en-GB-SoniaNeural"  # イギリス英語女性
    # voice = "en-GB-RyanNeural"  # イギリス英語男性
    
    print(f"✓ Using voice: {voice}")
    print("-" * 70)
    print("Starting generation...\n")
    
    success_count = 0
    skip_count = 0
    error_count = 0
    errors = []
    
    start_time = time.time()
    
    for i, question in enumerate(questions, 1):
        text = question['question']
        question_id = question['id']
        filename = f"word_{question_id}.mp3"
        filepath = f"{audio_dir}/{filename}"
        
        # 既存ファイルをスキップ
        if skip_existing and os.path.exists(filepath):
            skip_count += 1
            print(f"[{i}/{len(questions)}] ⊘ Skipped: {filename} - '{text}'")
            continue
        
        # 音声生成
        success, error = await generate_audio_with_retry(question, voice)
        
        if success:
            success_count += 1
            file_size = os.path.getsize(filepath) / 1024  # KB
            print(f"[{i}/{len(questions)}] ✓ Generated: {filename} ({file_size:.1f}KB) - '{text}'")
        else:
            error_count += 1
            errors.append((question_id, text, error))
            print(f"[{i}/{len(questions)}] ✗ Failed: {filename} - '{text}' - Error: {error}")
        
        # 進捗表示（10問ごと）
        if i % 10 == 0:
            elapsed = time.time() - start_time
            avg_time = elapsed / i
            remaining = avg_time * (len(questions) - i)
            print(f"  📊 Progress: {i}/{len(questions)} | Elapsed: {elapsed/60:.1f}min | ETA: {remaining/60:.1f}min")
    
    # 最終レポート
    elapsed = time.time() - start_time
    print("\n" + "=" * 70)
    print("📊 GENERATION COMPLETE")
    print("=" * 70)
    print(f"✓ Success: {success_count} files")
    if skip_count > 0:
        print(f"⊘ Skipped: {skip_count} files (already existed)")
    if error_count > 0:
        print(f"✗ Errors: {error_count} files")
    print(f"⏱️  Total time: {elapsed/60:.1f} minutes")
    
    # エラーの詳細表示
    if errors:
        print("\n" + "-" * 70)
        print("❌ ERRORS:")
        for qid, text, err in errors:
            print(f"  ID {qid}: '{text}' - {err}")
        print("-" * 70)
        print("\n💡 Tip: Run the script again to retry failed files")
    
    # ファイルサイズ計算
    total_size = 0
    for file in os.listdir(audio_dir):
        if file.endswith('.mp3'):
            total_size += os.path.getsize(os.path.join(audio_dir, file))
    
    print(f"💾 Total size: {total_size / (1024*1024):.1f} MB")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(generate_audio())
