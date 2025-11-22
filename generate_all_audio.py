import edge_tts
import asyncio
import json
import os

async def generate_audio():
    print("Starting audio generation...")
    
    # questions.jsonを読み込み
    try:
        with open('data/questions.json', 'r', encoding='utf-8') as f:
            questions = json.load(f)
        print(f"Loaded {len(questions)} questions")
    except Exception as e:
        print(f"Error loading questions.json: {e}")
        return
    
    # assets/audioフォルダが存在するか確認
    audio_dir = 'assets/audio'
    if not os.path.exists(audio_dir):
        os.makedirs(audio_dir)
        print(f"Created directory: {audio_dir}")
    
    # 音声設定
    voice = "en-GB-SoniaNeural"  # イギリス英語女性（高品質）
    # voice = "en-GB-RyanNeural"  # イギリス英語男性に変更したい場合はこちらをコメント解除
    
    print(f"Using voice: {voice}")
    print("Generating audio files...\n")
    
    success_count = 0
    error_count = 0
    
    for i, question in enumerate(questions, 1):
        text = question['question']
        question_id = question['id']
        filename = f"{audio_dir}/word_{question_id}.mp3"
        
        try:
            communicate = edge_tts.Communicate(text, voice)
            await communicate.save(filename)
            success_count += 1
            print(f"[{i}/{len(questions)}] ✓ Generated: {filename} - '{text}'")
        except Exception as e:
            error_count += 1
            print(f"[{i}/{len(questions)}] ✗ Error for '{text}': {e}")
    
    print(f"\n{'='*60}")
    print(f"Generation complete!")
    print(f"Success: {success_count} files")
    print(f"Errors: {error_count} files")
    print(f"Total size: ~{success_count * 50 // 1000}MB (estimated)")
    print(f"{'='*60}")

if __name__ == "__main__":
    # 実行
    asyncio.run(generate_audio())
