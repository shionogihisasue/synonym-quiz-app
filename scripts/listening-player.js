/**
 * Listening Practice Player
 * ========================
 * リスニング練習モードのプレイヤー機能を管理
 */

class ListeningPlayer {
    constructor() {
        this.audio = null;
        this.currentSession = null;
        this.isPlaying = false;
        this.isLooping = false;
        this.vocabularyData = null;
        
        this.initializeElements();
        this.loadVocabularyData();
    }

    /**
     * DOM要素の初期化
     */
    initializeElements() {
        // Sections
        this.startSection = document.getElementById('start-section');
        this.listeningSection = document.getElementById('listening-section');

        // Buttons
        this.startListeningBtn = document.getElementById('start-listening-btn');
        this.backToMenuBtn = document.getElementById('back-to-menu-listening');
        this.loadSessionBtn = document.getElementById('load-session-btn');

        // Session selector
        this.sessionSelect = document.getElementById('session-select');

        // Audio element
        this.audio = document.getElementById('listening-audio');

        // Player controls
        this.playBtn = document.getElementById('play-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.loopBtn = document.getElementById('loop-btn');

        // Seekbar
        this.seekbar = document.getElementById('seekbar');
        this.currentTimeDisplay = document.getElementById('current-time');
        this.totalTimeDisplay = document.getElementById('total-time');
        this.progressBar = document.getElementById('progress-bar');

        // Speed control
        this.speedButtons = document.querySelectorAll('.speed-btn');

        // Display elements
        this.sessionTitle = document.getElementById('session-title');
        this.sessionInfo = document.getElementById('session-info');
        this.wordButtonsContainer = document.getElementById('word-buttons');

        this.attachEventListeners();
    }

    /**
     * イベントリスナーの登録
     */
    attachEventListeners() {
        // Navigation
        this.startListeningBtn.addEventListener('click', () => this.showListeningSection());
        this.backToMenuBtn.addEventListener('click', () => this.backToMenu());
        this.loadSessionBtn.addEventListener('click', () => this.loadSelectedSession());

        // Player controls
        this.playBtn.addEventListener('click', () => this.play());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.loopBtn.addEventListener('click', () => this.toggleLoop());

        // Seekbar
        this.seekbar.addEventListener('input', (e) => this.seek(e.target.value));
        this.seekbar.addEventListener('change', (e) => this.seek(e.target.value));

        // Audio events
        this.audio.addEventListener('loadedmetadata', () => this.onAudioLoaded());
        this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
        this.audio.addEventListener('ended', () => this.onAudioEnded());
        this.audio.addEventListener('play', () => this.onPlay());
        this.audio.addEventListener('pause', () => this.onPause());

        // Speed control
        this.speedButtons.forEach(btn => {
            btn.addEventListener('click', () => this.setPlaybackRate(parseFloat(btn.dataset.speed)));
        });
    }

    /**
     * vocabulary JSONデータの読み込み
     */
    async loadVocabularyData() {
        try {
            const response = await fetch('data/listening_vocabulary.json');
            if (!response.ok) {
                throw new Error('Failed to load vocabulary data');
            }
            this.vocabularyData = await response.json();
            this.populateSessionSelector();
            console.log('✅ Vocabulary data loaded:', this.vocabularyData.metadata.totalWords, 'words');
        } catch (error) {
            console.error('❌ Error loading vocabulary data:', error);
            alert('Failed to load vocabulary data. Please check that data/listening_vocabulary.json exists.');
        }
    }

    /**
     * セッション選択ドロップダウンにオプションを追加
     */
    populateSessionSelector() {
        if (!this.vocabularyData) return;

        this.sessionSelect.innerHTML = '<option value="">Select a session...</option>';
        
        this.vocabularyData.sessions.forEach(session => {
            const option = document.createElement('option');
            option.value = session.id;
            option.textContent = `${session.title} (${session.words.length} words, ~${session.estimatedDuration})`;
            this.sessionSelect.appendChild(option);
        });
    }

    /**
     * リスニングセクションを表示
     */
    showListeningSection() {
        this.startSection.classList.add('hidden');
        this.listeningSection.classList.remove('hidden');
    }

    /**
     * メニューに戻る
     */
    backToMenu() {
        this.pause();
        this.listeningSection.classList.add('hidden');
        this.startSection.classList.remove('hidden');
        
        // リセット
        this.audio.src = '';
        this.currentSession = null;
        this.sessionTitle.textContent = 'No session loaded';
        this.sessionInfo.textContent = 'Select a session to begin';
        this.wordButtonsContainer.innerHTML = '';
    }

    /**
     * 選択されたセッションを読み込み
     */
    loadSelectedSession() {
        const sessionId = parseInt(this.sessionSelect.value);
        if (!sessionId) {
            alert('Please select a session first.');
            return;
        }

        const session = this.vocabularyData.sessions.find(s => s.id === sessionId);
        if (!session) {
            alert('Session not found.');
            return;
        }

        this.loadSession(session);
    }

    /**
     * セッションデータを読み込んでプレイヤーをセットアップ
     */
    loadSession(session) {
        this.currentSession = session;

        // 音声ファイルを読み込み
        this.audio.src = session.audioFile;
        this.audio.load();

        // セッション情報を表示
        this.sessionTitle.textContent = session.title;
        this.sessionInfo.textContent = `${session.words.length} words | Category: ${session.categoryRange}`;

        // 単語ボタンを生成
        this.generateWordButtons(session.words);

        console.log('✅ Session loaded:', session.title);
    }

    /**
     * 単語ジャンプボタンを生成
     */
    generateWordButtons(words) {
        this.wordButtonsContainer.innerHTML = '';

        words.forEach((word, index) => {
            const button = document.createElement('button');
            button.className = 'word-btn';
            button.textContent = word.word;
            button.title = `Jump to: ${word.word}`;
            
            // 推定位置にジャンプ（単語ごとに約20-30秒と仮定）
            button.addEventListener('click', () => {
                const estimatedPosition = index * 25; // 25秒/単語（調整可能）
                this.jumpToPosition(estimatedPosition);
            });

            this.wordButtonsContainer.appendChild(button);
        });
    }

    /**
     * 音声読み込み完了時
     */
    onAudioLoaded() {
        const duration = this.audio.duration;
        this.seekbar.max = duration;
        this.totalTimeDisplay.textContent = this.formatTime(duration);
        this.playBtn.disabled = false;
        
        console.log('✅ Audio loaded. Duration:', this.formatTime(duration));
    }

    /**
     * 再生
     */
    play() {
        if (this.audio.src) {
            this.audio.play();
        } else {
            alert('Please load a session first.');
        }
    }

    /**
     * 一時停止
     */
    pause() {
        this.audio.pause();
    }

    /**
     * 再生開始時
     */
    onPlay() {
        this.isPlaying = true;
        this.playBtn.disabled = true;
        this.pauseBtn.disabled = false;
    }

    /**
     * 一時停止時
     */
    onPause() {
        this.isPlaying = false;
        this.playBtn.disabled = false;
        this.pauseBtn.disabled = true;
    }

    /**
     * 時間更新時
     */
    onTimeUpdate() {
        const currentTime = this.audio.currentTime;
        const duration = this.audio.duration;

        // シークバー更新
        this.seekbar.value = currentTime;
        this.currentTimeDisplay.textContent = this.formatTime(currentTime);

        // プログレスバー更新
        const progress = (currentTime / duration) * 100;
        this.progressBar.style.width = `${progress}%`;
    }

    /**
     * 音声終了時
     */
    onAudioEnded() {
        if (this.isLooping) {
            this.audio.currentTime = 0;
            this.audio.play();
        } else {
            this.pause();
            this.audio.currentTime = 0;
        }
    }

    /**
     * シーク（再生位置変更）
     */
    seek(value) {
        this.audio.currentTime = parseFloat(value);
    }

    /**
     * 指定位置にジャンプ（秒）
     */
    jumpToPosition(seconds) {
        if (this.audio.src) {
            this.audio.currentTime = Math.min(seconds, this.audio.duration);
            if (!this.isPlaying) {
                this.play();
            }
        }
    }

    /**
     * ループ再生のトグル
     */
    toggleLoop() {
        this.isLooping = !this.isLooping;
        this.audio.loop = this.isLooping;
        
        if (this.isLooping) {
            this.loopBtn.classList.add('active');
            this.loopBtn.title = 'Loop: ON';
            this.loopBtn.querySelector('.label').textContent = 'Loop: ON';
        } else {
            this.loopBtn.classList.remove('active');
            this.loopBtn.title = 'Loop: OFF';
            this.loopBtn.querySelector('.label').textContent = 'Loop: OFF';
        }

        console.log('🔁 Loop:', this.isLooping ? 'ON' : 'OFF');
    }

    /**
     * 再生速度変更
     */
    setPlaybackRate(rate) {
        this.audio.playbackRate = rate;

        // アクティブボタンのスタイル更新
        this.speedButtons.forEach(btn => {
            if (parseFloat(btn.dataset.speed) === rate) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        console.log('⚡ Playback rate:', rate + 'x');
    }

    /**
     * 時間フォーマット（秒 → mm:ss）
     */
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// ページ読み込み完了後にプレイヤーを初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎧 Initializing Listening Player...');
    window.listeningPlayer = new ListeningPlayer();
});