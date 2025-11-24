/**
 * Synonym Quiz App - Final Fixed Version (listening-player.js対応)
 * ================================================================
 * listening-player.jsとの競合を解決した版
 */

// Global variables
let allQuestions = [];
let categories = [];
let currentCategory = null;
let currentQuestionIndex = 0;
let categoryScore = 0;
let categoryWrongAnswers = [];
let completedCategories = new Set();
let totalScore = 0;
let totalQuestions = 0;

// DOM elements
let startSection, quizSection, resultSection, categoryScreen;
let startQuizBtn, backToMenuBtn, quickStartBtn;
let categorySelect, categoryList;
let questionNumber, categoryDisplay, scoreDisplay, accuracyDisplay;
let questionText, optionsContainer;
let explanationContainerNew, explanationTextNew;
let nextBtn, speakBtn, continueBtn;
let startOverBtn;

/**
 * 初期化
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎯 Quiz App Initializing...');
    
    // DOM要素の取得
    initializeElements();
    
    // クイズデータの読み込み
    await loadQuestions();
    
    // イベントリスナーの登録
    attachEventListeners();
    
    console.log('✅ Quiz App Ready!');
});

/**
 * DOM要素の初期化
 */
function initializeElements() {
    // メインセクション
    startSection = document.getElementById('start-section');
    quizSection = document.getElementById('quiz-section');
    resultSection = document.getElementById('result-section');
    categoryScreen = document.getElementById('categoryScreen');
    
    // ボタン
    startQuizBtn = document.getElementById('startQuizBtn');
    backToMenuBtn = document.getElementById('back-to-menu'); // クイズ専用の戻るボタン
    quickStartBtn = document.getElementById('quick-start-btn');
    
    // カテゴリー関連
    categorySelect = document.getElementById('quick-category-select');
    categoryList = document.getElementById('category-container');
    
    // クイズUI要素
    questionNumber = document.getElementById('question-number');
    categoryDisplay = document.getElementById('category-display');
    scoreDisplay = document.getElementById('score');
    accuracyDisplay = document.getElementById('accuracy');
    questionText = document.getElementById('question-text');
    optionsContainer = document.getElementById('options-container');
    
    // フィードバック
    explanationContainerNew = document.getElementById('explanation-container');
    explanationTextNew = document.getElementById('explanation-text');
    
    // コントロールボタン
    nextBtn = document.getElementById('next-btn');
    speakBtn = document.getElementById('speak-btn');
    continueBtn = document.getElementById('continue-btn');
    
    // 結果画面
    startOverBtn = document.getElementById('restart-btn');
    
    // デバッグログ
    console.log('📋 DOM Elements Check:');
    console.log('  startSection:', startSection ? '✓' : '✗');
    console.log('  quizSection:', quizSection ? '✓' : '✗');
    console.log('  startQuizBtn:', startQuizBtn ? '✓' : '✗');
    console.log('  quickStartBtn:', quickStartBtn ? '✓' : '✗');
    console.log('  categorySelect:', categorySelect ? '✓' : '✗');
}

/**
 * クイズデータの読み込み
 */
async function loadQuestions() {
    try {
        const response = await fetch('data/questions.json');
        if (!response.ok) {
            throw new Error('Failed to load questions');
        }
        allQuestions = await response.json();
        
        console.log('✅ Loaded', allQuestions.length, 'questions');
        
        // カテゴリーを定義
        defineCategories();
        
        // UIを更新
        if (categoryList) displayCategories();
        populateCategoryDropdown();
        
        return true;
    } catch (error) {
        console.error('❌ Error loading questions:', error);
        alert('Failed to load questions. Please check that data/questions.json exists.');
        return false;
    }
}

/**
 * カテゴリーの定義
 */
function defineCategories() {
    // カテゴリーマッピング（category名 → 情報）
    const categoryMappings = [
        { category: 'basic-adjectives', name: 'Basic Adjectives', icon: '📝', desc: 'Fundamental descriptive words' },
        { category: 'basic-verbs', name: 'Basic Verbs', icon: '🏃', desc: 'Common action words' },
        { category: 'emotions', name: 'Emotions & Feelings', icon: '😊', desc: 'Words about feelings' },
        { category: 'size-quantity', name: 'Size & Quantity', icon: '📏', desc: 'Measurements and amounts' },
        { category: 'time-speed', name: 'Time & Speed', icon: '⏰', desc: 'Temporal and velocity terms' },
        { category: 'appearance', name: 'Appearance & Beauty', icon: '✨', desc: 'Visual characteristics' },
        { category: 'personality', name: 'Personality & Character', icon: '👤', desc: 'Character traits' },
        { category: 'difficulty', name: 'Difficulty & Ease', icon: '🎯', desc: 'Complexity levels' },
        { category: 'truth-honesty', name: 'Truth & Honesty', icon: '🤝', desc: 'Integrity and veracity' },
        { category: 'physical', name: 'Physical Properties', icon: '🔬', desc: 'Material characteristics' },
        { category: 'business-communication', name: 'Business Communication', icon: '💼', desc: 'Professional workplace vocabulary' },
        { category: 'meeting-presentation', name: 'Meeting & Presentation', icon: '📊', desc: 'Conference and presentation terms' },
        { category: 'pharmaceutical', name: 'Pharmaceutical Terms', icon: '💊', desc: 'Pharma industry vocabulary' },
        { category: 'clinical-research', name: 'Clinical Research', icon: '🔬', desc: 'Clinical trial terminology' },
        { category: 'data-science', name: 'Data Science Basics', icon: '📈', desc: 'Fundamental data science terms' },
        { category: 'machine-learning', name: 'Machine Learning', icon: '🤖', desc: 'ML terminology' },
        { category: 'daily-conversation', name: 'Daily Conversation', icon: '💬', desc: 'Everyday speech' },
        { category: 'food-dining', name: 'Food & Dining', icon: '🍽️', desc: 'Culinary vocabulary' },
        { category: 'travel-transportation', name: 'Travel & Transportation', icon: '✈️', desc: 'Travel terms' },
        { category: 'technology-digital', name: 'Technology & Digital', icon: '💻', desc: 'Tech vocabulary' },
        { category: 'advanced-business', name: 'Advanced Business Strategy', icon: '🎯', desc: 'Strategic business terms' },
        { category: 'executive-leadership', name: 'Executive Leadership', icon: '👔', desc: 'Leadership vocabulary' },
        { category: 'drug-development', name: 'Drug Development Process', icon: '🧬', desc: 'Drug development terms' },
        { category: 'regulatory-affairs', name: 'Regulatory Affairs', icon: '📋', desc: 'Regulatory vocabulary' },
        { category: 'advanced-analytics', name: 'Advanced Analytics', icon: '📊', desc: 'Analytics terms' },
        { category: 'ai-deep-learning', name: 'AI & Deep Learning', icon: '🧠', desc: 'AI terminology' },
        { category: 'formal-communication', name: 'Formal Communication', icon: '📝', desc: 'Formal writing' },
        { category: 'academic-research', name: 'Academic & Research', icon: '🎓', desc: 'Academic terms' },
        { category: 'finance-economics', name: 'Finance & Economics', icon: '💰', desc: 'Financial vocabulary' },
        { category: 'legal-compliance', name: 'Legal & Compliance', icon: '⚖️', desc: 'Legal terms' },
        { category: 'corporate-governance', name: 'Corporate Governance', icon: '🏢', desc: 'Governance vocabulary' },
        { category: 'quality-assurance', name: 'Quality Assurance', icon: '✅', desc: 'QA terminology' },
        { category: 'bioinformatics', name: 'Bioinformatics', icon: '🧬', desc: 'Bioinformatics terms' },
        { category: 'pharmacoeconomics', name: 'Pharmacoeconomics', icon: '💊', desc: 'Health economics' },
        { category: 'statistical-analysis', name: 'Statistical Analysis', icon: '📉', desc: 'Statistics vocabulary' },
        { category: 'nlp', name: 'Natural Language Processing', icon: '🗣️', desc: 'NLP terms' },
        { category: 'negotiation-diplomacy', name: 'Negotiation & Diplomacy', icon: '🤝', desc: 'Negotiation vocabulary' },
        { category: 'scientific-research', name: 'Scientific Research', icon: '🔬', desc: 'Research terms' },
        { category: 'risk-management', name: 'Risk Management', icon: '⚠️', desc: 'Risk vocabulary' },
        { category: 'intellectual-discourse', name: 'Intellectual Discourse', icon: '💭', desc: 'Academic discussion' },
        { category: 'project-management', name: 'Project Management', icon: '📋', desc: 'PM terminology' },
        { category: 'supply-chain', name: 'Supply Chain & Logistics', icon: '🚚', desc: 'Supply chain terms' },
        { category: 'medical-terminology', name: 'Medical Terminology', icon: '🏥', desc: 'Medical vocabulary' },
        { category: 'laboratory-procedures', name: 'Laboratory Procedures', icon: '🧪', desc: 'Lab terms' },
        { category: 'database-sql', name: 'Database & SQL', icon: '🗄️', desc: 'Database vocabulary' },
        { category: 'cloud-computing', name: 'Cloud Computing', icon: '☁️', desc: 'Cloud terms' },
        { category: 'social-interactions', name: 'Social Interactions', icon: '👥', desc: 'Social vocabulary' },
        { category: 'weather-nature', name: 'Weather & Nature', icon: '🌤️', desc: 'Nature vocabulary' },
        { category: 'ethics-morality', name: 'Ethics & Morality', icon: '⚖️', desc: 'Ethics terms' },
        { category: 'innovation-creativity', name: 'Innovation & Creativity', icon: '💡', desc: 'Innovation vocabulary' }
    ];
    
    // ユニークなカテゴリー名を取得
    const uniqueCategories = [...new Set(allQuestions.map(q => q.category))];
    
    // カテゴリーオブジェクトを生成
    categories = uniqueCategories.map((catName, index) => {
        const mapping = categoryMappings.find(m => m.category === catName);
        
        return {
            id: index + 1,
            name: mapping ? mapping.name : catName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            description: mapping ? mapping.desc : `${catName} vocabulary`,
            icon: mapping ? mapping.icon : '📚',
            questions: allQuestions.filter(q => q.category === catName)
        };
    });
    
    console.log('✅ Defined', categories.length, 'categories');
}

/**
 * カテゴリードロップダウンのポピュレート
 */
function populateCategoryDropdown() {
    if (!categorySelect) {
        console.warn('⚠️ categorySelect not found');
        return;
    }
    
    categorySelect.innerHTML = '<option value="">Select a category...</option>';
    
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = `${cat.id}. ${cat.icon} ${cat.name} (${cat.questions.length})`;
        categorySelect.appendChild(option);
    });
    
    console.log('✅ Category dropdown populated');
}

/**
 * カテゴリーカード表示
 */
function displayCategories() {
    if (!categoryList) {
        console.warn('⚠️ categoryList not found');
        return;
    }
    
    categoryList.innerHTML = '';
    
    categories.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'category-card';
        if (completedCategories.has(cat.id)) {
            card.classList.add('completed');
        }
        
        card.innerHTML = `
            <div class="category-info">
                <div class="category-name">${cat.icon} ${cat.name}</div>
                <div class="category-description">${cat.description} (${cat.questions.length} questions)</div>
            </div>
            <div class="category-status">${completedCategories.has(cat.id) ? '✓' : '▶'}</div>
        `;
        
        card.addEventListener('click', () => startCategory(cat));
        categoryList.appendChild(card);
    });
    
    console.log('✅ Category cards displayed');
}

/**
 * イベントリスナーの登録
 */
function attachEventListeners() {
    // Start Quiz button
    if (startQuizBtn) {
        console.log('✅ Attaching startQuizBtn listener');
        startQuizBtn.addEventListener('click', () => {
            console.log('🎯 START QUIZ clicked');
            startQuizFromNewUI();
        });
    } else {
        console.error('❌ startQuizBtn not found!');
    }
    
    // Quick Start button
    if (quickStartBtn) {
        console.log('✅ Attaching quickStartBtn listener');
        quickStartBtn.addEventListener('click', () => {
            console.log('📌 QUICK START clicked');
            quickStartQuiz();
        });
    } else {
        console.error('❌ quickStartBtn not found!');
    }
    
    // Back to Menu button
    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', backToMenuFromQuiz);
    }
    
    // Next button
    if (nextBtn) {
        nextBtn.addEventListener('click', nextQuestion);
    }
    
    // Speak button
    if (speakBtn) {
        speakBtn.addEventListener('click', () => {
            if (questionText && currentCategory) {
                speak(questionText.textContent);
            }
        });
    }
    
    // Continue button
    if (continueBtn) {
        continueBtn.addEventListener('click', continueAfterCheckpoint);
    }
    
    // Restart button
    if (startOverBtn) {
        startOverBtn.addEventListener('click', startOver);
    }
    
    console.log('✅ Event listeners attached');
}

/**
 * 新UIからクイズ開始
 */
function startQuizFromNewUI() {
    console.log('🎯 Starting quiz from new UI...');
    
    if (!allQuestions || allQuestions.length === 0) {
        alert('Questions not loaded yet. Please wait...');
        return;
    }
    
    // start-sectionを非表示
    if (startSection) {
        startSection.classList.add('hidden');
    }
    
    // カテゴリー画面を表示
    if (categoryScreen) {
        categoryScreen.classList.remove('hidden');
        displayCategories();
    } else {
        // カテゴリー画面がない場合は最初のカテゴリーから開始
        if (categories.length > 0) {
            startCategory(categories[0]);
        }
    }
}

/**
 * Quick Startでクイズ開始
 */
function quickStartQuiz() {
    console.log('📌 Quick Start function called');
    
    if (!categorySelect) {
        console.error('❌ categorySelect not found!');
        alert('カテゴリー選択が見つかりません');
        return;
    }
    
    const selectedId = parseInt(categorySelect.value);
    console.log('📌 Selected category ID:', selectedId);
    
    if (!selectedId || isNaN(selectedId)) {
        alert('カテゴリーを選択してください');
        return;
    }
    
    const selectedCategory = categories.find(cat => cat.id === selectedId);
    
    if (!selectedCategory) {
        console.error('❌ Category not found:', selectedId);
        alert('選択したカテゴリーが見つかりません');
        return;
    }
    
    console.log('✅ Starting category:', selectedCategory.name);
    startCategory(selectedCategory);
}

/**
 * クイズからメニューに戻る
 */
function backToMenuFromQuiz() {
    console.log('🔙 Back to menu');
    
    if (quizSection) quizSection.classList.add('hidden');
    if (categoryScreen) categoryScreen.classList.add('hidden');
    if (startSection) startSection.classList.remove('hidden');
}

/**
 * カテゴリー開始
 */
function startCategory(category) {
    console.log('🚀 Starting category:', category.name);
    
    currentCategory = category;
    currentQuestionIndex = 0;
    categoryScore = 0;
    categoryWrongAnswers = [];
    
    // シャッフル
    currentCategory.questions = shuffleArray(currentCategory.questions);
    
    // UI更新
    if (categoryDisplay) {
        categoryDisplay.textContent = `Category: ${currentCategory.name}`;
    }
    
    // 画面切り替え
    if (startSection) startSection.classList.add('hidden');
    if (categoryScreen) categoryScreen.classList.add('hidden');
    if (quizSection) quizSection.classList.remove('hidden');
    
    // 最初の問題を表示
    displayQuestion();
}

/**
 * 配列シャッフル
 */
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/**
 * 問題表示
 */
function displayQuestion() {
    if (!currentCategory || currentQuestionIndex >= currentCategory.questions.length) {
        console.warn('⚠️ No question to display');
        return;
    }
    
    const question = currentCategory.questions[currentQuestionIndex];
    
    console.log('📝 Question', currentQuestionIndex + 1, ':', question.question);
    
    // 進捗更新
    if (questionNumber) {
        questionNumber.textContent = `Question ${currentQuestionIndex + 1}/${currentCategory.questions.length}`;
    }
    
    // 問題文表示
    if (questionText) {
        questionText.textContent = question.question;
    }
    
    // 選択肢表示
    if (optionsContainer) {
        optionsContainer.innerHTML = '';
        const shuffledOptions = shuffleArray(question.options);
        
        shuffledOptions.forEach(option => {
            const btn = document.createElement('div');
            btn.className = 'option';
            btn.textContent = option;
            btn.addEventListener('click', () => selectAnswer(option, question.correctAnswer, question.explanation));
            optionsContainer.appendChild(btn);
        });
    }
    
    // フィードバックをリセット
    if (explanationContainerNew) {
        explanationContainerNew.classList.add('hidden');
    }
    
    if (nextBtn) {
        nextBtn.classList.add('hidden');
    }
    
    // 音声ボタン有効化
    if (speakBtn) {
        speakBtn.disabled = false;
        speakBtn.textContent = '🔊 Listen Again';
    }
}

/**
 * 回答選択
 */
function selectAnswer(selected, correct, explanationText) {
    const buttons = optionsContainer.querySelectorAll('.option');
    buttons.forEach(btn => {
        btn.style.pointerEvents = 'none';
        
        if (btn.textContent === correct) {
            btn.classList.add('correct');
        }
        if (btn.textContent === selected && selected !== correct) {
            btn.classList.add('incorrect');
        }
    });
    
    const isCorrect = selected === correct;
    
    if (isCorrect) {
        categoryScore++;
        totalScore++;
        console.log('✅ Correct!');
    } else {
        categoryWrongAnswers.push({
            question: currentCategory.questions[currentQuestionIndex].question,
            yourAnswer: selected,
            correctAnswer: correct,
            explanation: explanationText
        });
        console.log('❌ Incorrect');
    }
    
    totalQuestions++;
    
    // スコア更新
    updateScore();
    
    // 説明表示
    if (explanationContainerNew && explanationTextNew) {
        explanationTextNew.textContent = explanationText;
        explanationContainerNew.classList.remove('hidden');
    }
    
    // Next button表示
    if (nextBtn) {
        nextBtn.classList.remove('hidden');
    }
}

/**
 * スコア更新
 */
function updateScore() {
    if (scoreDisplay) {
        scoreDisplay.textContent = `Score: ${categoryScore}`;
    }
    
    if (accuracyDisplay && totalQuestions > 0) {
        const acc = Math.round((totalScore / totalQuestions) * 100);
        accuracyDisplay.textContent = `Accuracy: ${acc}%`;
    }
}

/**
 * 次の問題
 */
function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < currentCategory.questions.length) {
        displayQuestion();
    } else {
        showResults();
    }
}

/**
 * 結果表示
 */
function showResults() {
    console.log('🎊 Quiz complete!');
    
    if (quizSection) quizSection.classList.add('hidden');
    if (resultSection) resultSection.classList.remove('hidden');
    
    const totalQuestionsElem = document.getElementById('total-questions');
    const correctAnswersElem = document.getElementById('correct-answers');
    const finalScoreElem = document.getElementById('final-score');
    
    if (totalQuestionsElem) {
        totalQuestionsElem.textContent = currentCategory.questions.length;
    }
    
    if (correctAnswersElem) {
        correctAnswersElem.textContent = categoryScore;
    }
    
    if (finalScoreElem) {
        const percent = Math.round((categoryScore / currentCategory.questions.length) * 100);
        finalScoreElem.textContent = percent + '%';
    }
    
    completedCategories.add(currentCategory.id);
}

/**
 * チェックポイント後に続行
 */
function continueAfterCheckpoint() {
    const checkpointMessage = document.getElementById('checkpoint-message');
    if (checkpointMessage) {
        checkpointMessage.classList.add('hidden');
    }
    
    const questionContainer = document.getElementById('question-container');
    if (questionContainer) {
        questionContainer.classList.remove('hidden');
    }
}

/**
 * リセット
 */
function startOver() {
    console.log('🔄 Restart');
    
    completedCategories.clear();
    totalScore = 0;
    totalQuestions = 0;
    currentQuestionIndex = 0;
    categoryScore = 0;
    categoryWrongAnswers = [];
    
    if (resultSection) resultSection.classList.add('hidden');
    if (startSection) startSection.classList.remove('hidden');
    
    displayCategories();
}

/**
 * 音声読み上げ
 */
function speak(text) {
    if (!currentCategory || currentQuestionIndex >= currentCategory.questions.length) {
        console.error('No current question');
        return;
    }
    
    const currentQuestion = currentCategory.questions[currentQuestionIndex];
    const audioPath = `assets/audio/word_${currentQuestion.id}.mp3`;
    
    console.log(`🔊 Playing: ${audioPath}`);
    
    if (speakBtn) {
        speakBtn.disabled = true;
        speakBtn.textContent = '🔊 Playing...';
    }
    
    const audio = new Audio(audioPath);
    
    audio.addEventListener('ended', () => {
        if (speakBtn) {
            speakBtn.disabled = false;
            speakBtn.textContent = '🔊 Listen Again';
        }
    });
    
    audio.addEventListener('error', () => {
        console.warn('⚠️ Audio file not found, using Web Speech API');
        
        if (speakBtn) {
            speakBtn.disabled = false;
            speakBtn.textContent = '🔊 Listen Again';
        }
        
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-GB';
            utterance.rate = 0.85;
            
            utterance.addEventListener('end', () => {
                if (speakBtn) {
                    speakBtn.disabled = false;
                    speakBtn.textContent = '🔊 Listen Again';
                }
            });
            
            speechSynthesis.speak(utterance);
        }
    });
    
    audio.play();
}