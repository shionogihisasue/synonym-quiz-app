/**
 * Listening Practice Player V2
 * ============================
 * 字幕（リアルタイム表示）機能付き
 */

class ListeningPlayer {
    constructor() {
        this.audio = null;
        this.currentSession = null;
        this.isPlaying = false;
        this.isLooping = false;
        this.vocabularyData = null;
        this.timestampsData = null;
        this.currentSubtitleIndex = -1;
        
        this.initializeElements();
        this.loadVocabularyData();
    }

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

        // 字幕表示エリア
        this.subtitleDisplay = document.getElementById('subtitle-display');

        this.attachEventListeners();
    }

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

    showListeningSection() {
        this.startSection.classList.add('hidden');
        this.listeningSection.classList.remove('hidden');
    }

    backToMenu() {
        this.pause();
        this.listeningSection.classList.add('hidden');
        this.startSection.classList.remove('hidden');
        
        // リセット
        this.audio.src = '';
        this.currentSession = null;
        this.timestampsData = null;
        this.sessionTitle.textContent = 'No session loaded';
        this.sessionInfo.textContent = 'Select a session to begin';
        this.wordButtonsContainer.innerHTML = '';
        this.clearSubtitle();
    }

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

    async loadSession(session) {
        this.currentSession = session;

        // 音声ファイルを読み込み
        this.audio.src = session.audioFile;
        this.audio.load();

        // セッション情報を表示
        this.sessionTitle.textContent = session.title;
        this.sessionInfo.textContent = `${session.words.length} words | Category: ${session.categoryRange}`;

        // タイムスタンプデータを読み込み
        await this.loadTimestamps(session.id);

        // 単語ボタンを生成
        this.generateWordButtons(session.words);

        console.log('✅ Session loaded:', session.title);
    }

    async loadTimestamps(sessionId) {
        try {
            const timestampFile = `assets/audio/listening/session_${sessionId}_timestamps.json`;
            const response = await fetch(timestampFile);
            if (response.ok) {
                this.timestampsData = await response.json();
                console.log('✅ Timestamps loaded:', this.timestampsData.length, 'entries');
            } else {
                console.warn('⚠️ Timestamps file not found, subtitle feature disabled');
                this.timestampsData = null;
            }
        } catch (error) {
            console.warn('⚠️ Failed to load timestamps:', error);
            this.timestampsData = null;
        }
    }

    generateWordButtons(words) {
        this.wordButtonsContainer.innerHTML = '';

        words.forEach((word, index) => {
            const button = document.createElement('button');
            button.className = 'word-btn';
            button.textContent = word.word;
            button.title = `Jump to: ${word.word}`;
            
            button.addEventListener('click', () => {
                if (this.timestampsData && this.timestampsData[index]) {
                    // タイムスタンプがある場合は正確な位置へ
                    this.jumpToPosition(this.timestampsData[index].startTime);
                } else {
                    // タイムスタンプがない場合は推定位置へ
                    const estimatedPosition = index * 25;
                    this.jumpToPosition(estimatedPosition);
                }
            });

            this.wordButtonsContainer.appendChild(button);
        });
    }

    onAudioLoaded() {
        const duration = this.audio.duration;
        this.seekbar.max = duration;
        this.totalTimeDisplay.textContent = this.formatTime(duration);
        this.playBtn.disabled = false;
        
        console.log('✅ Audio loaded. Duration:', this.formatTime(duration));
    }

    play() {
        if (this.audio.src) {
            this.audio.play();
        } else {
            alert('Please load a session first.');
        }
    }

    pause() {
        this.audio.pause();
    }

    onPlay() {
        this.isPlaying = true;
        this.playBtn.disabled = true;
        this.pauseBtn.disabled = false;
    }

    onPause() {
        this.isPlaying = false;
        this.playBtn.disabled = false;
        this.pauseBtn.disabled = true;
    }

    onTimeUpdate() {
        const currentTime = this.audio.currentTime;
        const duration = this.audio.duration;

        // シークバー更新
        this.seekbar.value = currentTime;
        this.currentTimeDisplay.textContent = this.formatTime(currentTime);

        // プログレスバー更新
        const progress = (currentTime / duration) * 100;
        this.progressBar.style.width = `${progress}%`;

        // 字幕更新
        this.updateSubtitle(currentTime);
    }

    /**
     * 字幕の更新（リアルタイム表示）
     */
    updateSubtitle(currentTime) {
        if (!this.timestampsData) return;

        // 現在の時間に対応する字幕を探す
        for (let i = 0; i < this.timestampsData.length; i++) {
            const entry = this.timestampsData[i];
            
            if (currentTime >= entry.startTime && currentTime < entry.endTime) {
                if (this.currentSubtitleIndex !== i) {
                    this.currentSubtitleIndex = i;
                    this.displaySubtitle(entry);
                }
                return;
            }
        }

        // 該当する字幕がない場合はクリア
        if (this.currentSubtitleIndex !== -1) {
            this.clearSubtitle();
            this.currentSubtitleIndex = -1;
        }
    }

    /**
     * 字幕を表示
     */
    displaySubtitle(entry) {
        if (!this.subtitleDisplay) return;

        // 現在再生中の内容を判定
        const currentTime = this.audio.currentTime;
        const elapsed = currentTime - entry.startTime;
        const totalDuration = entry.endTime - entry.startTime;
        const progress = elapsed / totalDuration;

        let currentText = '';
        let subtitle = '';

        // 進捗に応じて表示内容を切り替え
        if (progress < 0.15) {
            // 単語を表示（最初の15%）
            currentText = entry.word;
            subtitle = `<div class="subtitle-word">${entry.word}</div>`;
        } else if (progress < 0.25) {
            // 同義語を表示（15-25%）
            currentText = 'Synonyms: ' + entry.synonyms;
            subtitle = `
                <div class="subtitle-word">${entry.word}</div>
                <div class="subtitle-synonyms">Synonyms: ${entry.synonyms}</div>
            `;
        } else if (progress < 0.45) {
            // Daily例文（25-45%）
            currentText = entry.daily;
            subtitle = `
                <div class="subtitle-label">Daily Conversation:</div>
                <div class="subtitle-text">${entry.daily}</div>
            `;
        } else if (progress < 0.70) {
            // Pharmaceutical例文（45-70%）
            currentText = entry.pharmaceutical;
            subtitle = `
                <div class="subtitle-label">Pharmaceutical Context:</div>
                <div class="subtitle-text">${entry.pharmaceutical}</div>
            `;
        } else {
            // Data Science例文（70-100%）
            currentText = entry.dataScience;
            subtitle = `
                <div class="subtitle-label">Data Science/IT Context:</div>
                <div class="subtitle-text">${entry.dataScience}</div>
            `;
        }

        this.subtitleDisplay.innerHTML = subtitle;
        this.subtitleDisplay.classList.remove('hidden');
    }

    /**
     * 字幕をクリア
     */
    clearSubtitle() {
        if (this.subtitleDisplay) {
            this.subtitleDisplay.innerHTML = '<div class="subtitle-placeholder">Listening...</div>';
        }
    }

    onAudioEnded() {
        if (this.isLooping) {
            this.audio.currentTime = 0;
            this.audio.play();
        } else {
            this.pause();
            this.audio.currentTime = 0;
        }
    }

    seek(value) {
        this.audio.currentTime = parseFloat(value);
    }

    jumpToPosition(seconds) {
        if (this.audio.src) {
            this.audio.currentTime = Math.min(seconds, this.audio.duration);
            if (!this.isPlaying) {
                this.play();
            }
        }
    }

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

    setPlaybackRate(rate) {
        this.audio.playbackRate = rate;

        this.speedButtons.forEach(btn => {
            if (parseFloat(btn.dataset.speed) === rate) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        console.log('⚡ Playback rate:', rate + 'x');
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// ページ読み込み完了後にプレイヤーを初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎧 Initializing Listening Player V2 (with subtitles)...');
    window.listeningPlayer = new ListeningPlayer();
});