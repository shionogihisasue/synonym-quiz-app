/**
 * Synonym Quiz App - Final Fixed Version
 * ========================================
 * 既存のカテゴリーシステム + 新しいHTML構造に対応
 * Quick Start機能とSTART QUIZボタンの修正版
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

// DOM elements - 新旧両方のHTMLに対応
let startScreen, categoryScreen, quizScreen, checkpointScreen, resultScreen;
let startSection, quizSection, resultSection;
let selectCategoryBtn, backToStartBtn, startQuizBtn, backToMenuBtn;
let categoryList, categoryTitle;
let speakBtn, nextBtn, questionText, optionsContainer, feedback, feedbackText, explanation;
let currentQuestionSpan, totalQuestionsSpan, progressFill;
let completedCategory, checkpointScore, checkpointAccuracy, checkpointWrongAnswers;
let checkpointWrongList, retryCategory, nextCategory, backToCategories;
let finalScore, accuracy, completedCount, startOverBtn;
let categorySelect, quickStartBtn, startQuickBtn;

// 新しいHTML要素
let questionNumber, categoryDisplay, scoreDisplay, accuracyDisplay;
let optionsContainerNew, explanationContainerNew, explanationTextNew, nextBtnNew;

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
    // 旧HTML要素（もしあれば）
    startScreen = document.getElementById('startScreen');
    categoryScreen = document.getElementById('categoryScreen');
    quizScreen = document.getElementById('quizScreen');
    checkpointScreen = document.getElementById('checkpointScreen');
    resultScreen = document.getElementById('resultScreen');
    
    // 新HTML要素
    startSection = document.getElementById('start-section');
    quizSection = document.getElementById('quiz-section');
    resultSection = document.getElementById('result-section');
    
    // ボタン
    selectCategoryBtn = document.getElementById('selectCategoryBtn');
    backToStartBtn = document.getElementById('backToStartBtn');
    startQuizBtn = document.getElementById('startQuizBtn');
    backToMenuBtn = document.getElementById('back-to-menu');
    nextBtn = document.getElementById('nextBtn') || document.getElementById('next-btn');
    continueBtn = document.getElementById('continue-btn');
    speakBtn = document.getElementById('speakBtn') || document.getElementById('speak-btn');
    
    // クイズ要素
    categoryList = document.getElementById('categoryList') || document.getElementById('category-container');
    categoryTitle = document.getElementById('categoryTitle');
    questionText = document.getElementById('questionText') || document.getElementById('question-text');
    optionsContainer = document.getElementById('optionsContainer') || document.getElementById('options-container');
    
    // 新しいHTML用
    questionNumber = document.getElementById('question-number');
    categoryDisplay = document.getElementById('category-display');
    scoreDisplay = document.getElementById('score');
    accuracyDisplay = document.getElementById('accuracy');
    explanationContainerNew = document.getElementById('explanation-container');
    explanationTextNew = document.getElementById('explanation-text');
    nextBtnNew = document.getElementById('next-btn');
    
    // 旧HTML用
    feedback = document.getElementById('feedback');
    feedbackText = document.getElementById('feedbackText');
    explanation = document.getElementById('explanation');
    currentQuestionSpan = document.getElementById('currentQuestion');
    totalQuestionsSpan = document.getElementById('totalQuestions');
    progressFill = document.getElementById('progressFill');
    
    // チェックポイント要素
    completedCategory = document.getElementById('completedCategory');
    checkpointScore = document.getElementById('checkpointScore');
    checkpointAccuracy = document.getElementById('checkpointAccuracy');
    checkpointWrongAnswers = document.getElementById('checkpointWrongAnswers');
    checkpointWrongList = document.getElementById('checkpointWrongList');
    retryCategory = document.getElementById('retryCategory');
    nextCategory = document.getElementById('nextCategory');
    backToCategories = document.getElementById('backToCategories');
    
    // リザルト要素
    finalScore = document.getElementById('finalScore') || document.getElementById('final-score');
    accuracy = document.getElementById('accuracy');
    completedCount = document.getElementById('completedCount');
    startOverBtn = document.getElementById('startOverBtn') || document.getElementById('restart-btn');
    
    // Quick Start
    categorySelect = document.getElementById('quick-category-select');
    startQuickBtn = document.getElementById('startQuickBtn');
    quickStartBtn = document.getElementById('quick-start-btn');
    
    console.log('✅ DOM elements initialized');
    console.log('  - startQuizBtn:', startQuizBtn ? '✓' : '✗');
    console.log('  - quickStartBtn:', quickStartBtn ? '✓' : '✗');
    console.log('  - categorySelect:', categorySelect ? '✓' : '✗');
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
    categories = [
        {
            id: 1,
            name: 'Basic Adjectives',
            description: 'Fundamental descriptive words',
            icon: '📝',
            questions: allQuestions.filter(q => q.category === 'basic-adjectives')
        },
        {
            id: 2,
            name: 'Basic Verbs',
            description: 'Common action words',
            icon: '🏃',
            questions: allQuestions.filter(q => q.category === 'basic-verbs')
        },
        {
            id: 3,
            name: 'Emotions & Feelings',
            description: 'Words about feelings',
            icon: '😊',
            questions: allQuestions.filter(q => q.category === 'emotions')
        },
        {
            id: 4,
            name: 'Size & Quantity',
            description: 'Measurements and amounts',
            icon: '📏',
            questions: allQuestions.filter(q => q.category === 'size-quantity')
        },
        {
            id: 5,
            name: 'Time & Speed',
            description: 'Temporal and velocity terms',
            icon: '⏰',
            questions: allQuestions.filter(q => q.category === 'time-speed')
        },
        {
            id: 6,
            name: 'Appearance & Beauty',
            description: 'Visual characteristics',
            icon: '✨',
            questions: allQuestions.filter(q => q.category === 'appearance')
        },
        {
            id: 7,
            name: 'Personality & Character',
            description: 'Character traits',
            icon: '👤',
            questions: allQuestions.filter(q => q.category === 'personality')
        },
        {
            id: 8,
            name: 'Difficulty & Ease',
            description: 'Complexity levels',
            icon: '🎯',
            questions: allQuestions.filter(q => q.category === 'difficulty')
        },
        {
            id: 9,
            name: 'Truth & Honesty',
            description: 'Integrity and veracity',
            icon: '🤝',
            questions: allQuestions.filter(q => q.category === 'truth-honesty')
        },
        {
            id: 10,
            name: 'Physical Properties',
            description: 'Material characteristics',
            icon: '🔬',
            questions: allQuestions.filter(q => q.category === 'physical')
        },
        {
            id: 11,
            name: 'Business Communication',
            description: 'Professional workplace vocabulary',
            icon: '💼',
            questions: allQuestions.filter(q => q.category === 'business-communication')
        },
        {
            id: 12,
            name: 'Meeting & Presentation',
            description: 'Conference and presentation terms',
            icon: '📊',
            questions: allQuestions.filter(q => q.category === 'meeting-presentation')
        },
        {
            id: 13,
            name: 'Pharmaceutical Terms',
            description: 'Pharma industry vocabulary',
            icon: '💊',
            questions: allQuestions.filter(q => q.category === 'pharmaceutical')
        },
        {
            id: 14,
            name: 'Clinical Research',
            description: 'Clinical trial terminology',
            icon: '🔬',
            questions: allQuestions.filter(q => q.category === 'clinical-research')
        },
        {
            id: 15,
            name: 'Data Science Basics',
            description: 'Fundamental data science terms',
            icon: '📈',
            questions: allQuestions.filter(q => q.category === 'data-science')
        }
    ];
    
    // 残りのカテゴリーを自動生成
    const categoryMappings = [
        { category: 'machine-learning', name: 'Machine Learning', icon: '🤖' },
        { category: 'daily-conversation', name: 'Daily Conversation', icon: '💬' },
        { category: 'food-dining', name: 'Food & Dining', icon: '🍽️' },
        { category: 'travel-transportation', name: 'Travel & Transportation', icon: '✈️' },
        { category: 'technology-digital', name: 'Technology & Digital', icon: '💻' },
        { category: 'advanced-business', name: 'Advanced Business Strategy', icon: '🎯' },
        { category: 'executive-leadership', name: 'Executive Leadership', icon: '👔' },
        { category: 'drug-development', name: 'Drug Development Process', icon: '🧬' },
        { category: 'regulatory-affairs', name: 'Regulatory Affairs', icon: '📋' },
        { category: 'advanced-analytics', name: 'Advanced Analytics', icon: '📊' },
        { category: 'ai-deep-learning', name: 'AI & Deep Learning', icon: '🧠' },
        { category: 'formal-communication', name: 'Formal Communication', icon: '📝' },
        { category: 'academic-research', name: 'Academic & Research', icon: '🎓' },
        { category: 'finance-economics', name: 'Finance & Economics', icon: '💰' },
        { category: 'legal-compliance', name: 'Legal & Compliance', icon: '⚖️' },
        { category: 'corporate-governance', name: 'Corporate Governance', icon: '🏢' },
        { category: 'quality-assurance', name: 'Quality Assurance', icon: '✅' },
        { category: 'bioinformatics', name: 'Bioinformatics', icon: '🧬' },
        { category: 'pharmacoeconomics', name: 'Pharmacoeconomics', icon: '💊' },
        { category: 'statistical-analysis', name: 'Statistical Analysis', icon: '📉' },
        { category: 'nlp', name: 'Natural Language Processing', icon: '🗣️' },
        { category: 'negotiation-diplomacy', name: 'Negotiation & Diplomacy', icon: '🤝' },
        { category: 'scientific-research', name: 'Scientific Research', icon: '🔬' },
        { category: 'risk-management', name: 'Risk Management', icon: '⚠️' },
        { category: 'intellectual-discourse', name: 'Intellectual Discourse', icon: '💭' },
        { category: 'project-management', name: 'Project Management', icon: '📋' },
        { category: 'supply-chain', name: 'Supply Chain & Logistics', icon: '🚚' },
        { category: 'medical-terminology', name: 'Medical Terminology', icon: '🏥' },
        { category: 'laboratory-procedures', name: 'Laboratory Procedures', icon: '🧪' },
        { category: 'database-sql', name: 'Database & SQL', icon: '🗄️' },
        { category: 'cloud-computing', name: 'Cloud Computing', icon: '☁️' },
        { category: 'social-interactions', name: 'Social Interactions', icon: '👥' },
        { category: 'weather-nature', name: 'Weather & Nature', icon: '🌤️' },
        { category: 'ethics-morality', name: 'Ethics & Morality', icon: '⚖️' },
        { category: 'innovation-creativity', name: 'Innovation & Creativity', icon: '💡' }
    ];
    
    // 全ユニークカテゴリーを取得
    const uniqueCategories = [...new Set(allQuestions.map(q => q.category))];
    
    // まだ定義されていないカテゴリーを追加
    uniqueCategories.forEach((catName) => {
        const existingCat = categories.find(c => 
            c.questions.some(q => q.category === catName)
        );
        
        if (!existingCat) {
            const mapping = categoryMappings.find(m => m.category === catName);
            const id = categories.length + 1;
            
            categories.push({
                id: id,
                name: mapping ? mapping.name : catName.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' '),
                description: `${catName} vocabulary`,
                icon: mapping ? mapping.icon : '📚',
                questions: allQuestions.filter(q => q.category === catName)
            });
        }
    });
    
    console.log('✅ Defined', categories.length, 'categories');
}

/**
 * カテゴリー選択ドロップダウンのポピュレート
 */
function populateCategoryDropdown() {
    if (!categorySelect) {
        console.warn('⚠️ categorySelect element not found');
        return;
    }
    
    categorySelect.innerHTML = '<option value="">Select a category...</option>';
    
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = `${cat.id}. ${cat.icon} ${cat.name} (${cat.questions.length})`;
        categorySelect.appendChild(option);
    });
    
    console.log('✅ Category dropdown populated with', categories.length, 'categories');
}

/**
 * カテゴリー表示（カード形式）
 */
function displayCategories() {
    if (!categoryList) {
        console.warn('⚠️ categoryList element not found');
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
    // Start Quiz button（新HTML）
    if (startQuizBtn) {
        console.log('✅ Attaching startQuizBtn listener');
        startQuizBtn.addEventListener('click', startQuizFromNewUI);
    } else {
        console.warn('⚠️ startQuizBtn not found');
    }
    
    // Back to Menu button（新HTML）
    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', backToMenuFromQuiz);
    }
    
    // Quick Start button（新HTML）
    if (quickStartBtn) {
        console.log('✅ Attaching quickStartBtn listener');
        quickStartBtn.addEventListener('click', quickStartQuiz);
    } else {
        console.warn('⚠️ quickStartBtn not found');
    }
    
    // 旧HTML用ボタン
    if (selectCategoryBtn) {
        selectCategoryBtn.addEventListener('click', showCategoryScreen);
    }
    
    if (backToStartBtn) {
        backToStartBtn.addEventListener('click', () => {
            if (categoryScreen) categoryScreen.classList.remove('active');
            if (startScreen) startScreen.classList.add('active');
        });
    }
    
    // Next button
    if (nextBtn) {
        nextBtn.addEventListener('click', nextQuestion);
    }
    
    if (nextBtnNew) {
        nextBtnNew.addEventListener('click', nextQuestion);
    }
    
    // Speak button
    if (speakBtn) {
        speakBtn.addEventListener('click', () => {
            if (questionText) {
                speak(questionText.textContent);
            }
        });
    }
    
    // Continue button (checkpoint)
    if (continueBtn) {
        continueBtn.addEventListener('click', continueAfterCheckpoint);
    }
    
    // Result buttons
    if (startOverBtn) {
        startOverBtn.addEventListener('click', startOver);
    }
    
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', startOver);
    }
    
    // Quick Start event listeners（旧HTML）
    if (startQuickBtn) {
        startQuickBtn.addEventListener('click', quickStartQuiz);
    }
    
    // Checkpoint buttons
    if (retryCategory) {
        retryCategory.addEventListener('click', retryCategoryQuiz);
    }
    
    if (nextCategory) {
        nextCategory.addEventListener('click', goToNextCategory);
    }
    
    if (backToCategories) {
        backToCategories.addEventListener('click', backToCategorySelection);
    }
    
    console.log('✅ All event listeners attached');
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
    
    // カテゴリー画面を表示
    if (startSection) startSection.classList.add('hidden');
    
    // カテゴリー選択画面があれば表示
    if (categoryScreen) {
        categoryScreen.classList.add('active');
        displayCategories();
    } else {
        // カテゴリー選択画面がない場合は最初のカテゴリーから開始
        if (categories.length > 0) {
            startCategory(categories[0]);
            if (quizSection) quizSection.classList.remove('hidden');
        }
    }
}

/**
 * クイズからメニューに戻る
 */
function backToMenuFromQuiz() {
    if (quizSection) quizSection.classList.add('hidden');
    if (categoryScreen) categoryScreen.classList.remove('active');
    if (startSection) startSection.classList.remove('hidden');
}

/**
 * カテゴリー画面表示
 */
function showCategoryScreen() {
    if (startScreen) startScreen.classList.remove('active');
    if (categoryScreen) categoryScreen.classList.add('active');
}

/**
 * Quick Startでクイズ開始（修正版）
 */
function quickStartQuiz() {
    console.log('📌 Quick Start clicked');
    
    // 要素を取得
    const selectElement = document.getElementById('quick-category-select');
    
    if (!selectElement) {
        console.error('❌ quick-category-select element not found!');
        alert('カテゴリー選択が見つかりません。ページを再読み込みしてください。');
        return;
    }
    
    const selectedId = parseInt(selectElement.value);
    
    if (!selectedId || isNaN(selectedId)) {
        alert('カテゴリーを選択してください');
        return;
    }
    
    console.log('📌 Quick Start: Selected category ID:', selectedId);
    
    // カテゴリーを取得
    const selectedCategory = categories.find(cat => cat.id === selectedId);
    
    if (!selectedCategory) {
        console.error('❌ Category not found:', selectedId);
        alert('選択したカテゴリーが見つかりません');
        return;
    }
    
    console.log('📌 Quick Start: Starting category', selectedCategory.name);
    
    // カテゴリー開始
    startCategory(selectedCategory);
    
    // セクション切り替え（新HTML）
    if (startSection) startSection.classList.add('hidden');
    if (quizSection) quizSection.classList.remove('hidden');
    
    // セクション切り替え（旧HTML）
    if (startScreen) startScreen.classList.remove('active');
    if (categoryScreen) categoryScreen.classList.remove('active');
    if (quizScreen) quizScreen.classList.add('active');
}

/**
 * カテゴリー開始
 */
function startCategory(category) {
    currentCategory = category;
    currentQuestionIndex = 0;
    categoryScore = 0;
    categoryWrongAnswers = [];
    
    // Shuffle questions
    currentCategory.questions = shuffleArray(currentCategory.questions);
    
    console.log('✅ Starting category:', category.name, '(', category.questions.length, 'questions)');
    
    // UI更新
    if (categoryTitle) {
        categoryTitle.textContent = `${currentCategory.icon} ${currentCategory.name}`;
    }
    
    if (categoryDisplay) {
        categoryDisplay.textContent = `Category: ${currentCategory.name}`;
    }
    
    if (totalQuestionsSpan) {
        totalQuestionsSpan.textContent = currentCategory.questions.length;
    }
    
    // 画面を表示
    if (categoryScreen) categoryScreen.classList.remove('active');
    if (quizScreen) quizScreen.classList.add('active');
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
    
    console.log('📝 Displaying question', currentQuestionIndex + 1, ':', question.question);
    
    // 進捗更新
    if (progressFill) {
        const progress = ((currentQuestionIndex + 1) / currentCategory.questions.length) * 100;
        progressFill.style.width = progress + '%';
    }
    
    if (currentQuestionSpan) {
        currentQuestionSpan.textContent = currentQuestionIndex + 1;
    }
    
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
    if (feedback) {
        feedback.classList.add('hidden');
    }
    
    if (explanationContainerNew) {
        explanationContainerNew.classList.add('hidden');
    }
    
    if (nextBtn) {
        nextBtn.classList.add('hidden');
    }
    
    if (nextBtnNew) {
        nextBtnNew.classList.add('hidden');
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
        console.log('❌ Incorrect. Correct answer:', correct);
    }
    
    totalQuestions++;
    
    // スコア更新
    updateScore();
    
    // フィードバック表示（新HTML）
    if (explanationContainerNew && explanationTextNew) {
        explanationTextNew.textContent = explanationText;
        explanationContainerNew.classList.remove('hidden');
    }
    
    // フィードバック表示（旧HTML）
    if (feedback && feedbackText) {
        feedback.classList.remove('hidden');
        if (isCorrect) {
            feedback.className = 'feedback correct';
            feedbackText.textContent = '✓ Correct!';
        } else {
            feedback.className = 'feedback wrong';
            feedbackText.textContent = '✗ Incorrect';
        }
    }
    
    if (explanation) {
        explanation.textContent = explanationText;
    }
    
    // Next button表示
    if (nextBtn) {
        nextBtn.classList.remove('hidden');
    }
    
    if (nextBtnNew) {
        nextBtnNew.classList.remove('hidden');
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
        showCheckpoint();
    }
}

/**
 * チェックポイント表示
 */
function showCheckpoint() {
    console.log('🎉 Category completed!');
    
    // 新HTML: 結果画面に移行
    if (quizSection && resultSection) {
        quizSection.classList.add('hidden');
        resultSection.classList.remove('hidden');
        showFinalResults();
        return;
    }
    
    // 旧HTML: チェックポイント画面
    if (checkpointScreen && quizScreen) {
        quizScreen.classList.remove('active');
        checkpointScreen.classList.add('active');
        
        if (completedCategory) {
            completedCategory.textContent = `${currentCategory.icon} ${currentCategory.name}`;
        }
        
        const accuracyPercent = Math.round((categoryScore / currentCategory.questions.length) * 100);
        
        if (checkpointScore) {
            checkpointScore.textContent = `${categoryScore}/${currentCategory.questions.length}`;
        }
        
        if (checkpointAccuracy) {
            checkpointAccuracy.textContent = `${accuracyPercent}%`;
        }
        
        completedCategories.add(currentCategory.id);
        
        // 間違えた問題表示
        if (categoryWrongAnswers.length > 0 && checkpointWrongAnswers && checkpointWrongList) {
            checkpointWrongAnswers.classList.remove('hidden');
            checkpointWrongList.innerHTML = '';
            
            categoryWrongAnswers.forEach(item => {
                const div = document.createElement('div');
                div.className = 'wrong-answer-item';
                div.innerHTML = `
                    <strong>Question:</strong> ${item.question}<br>
                    <strong>Your answer:</strong> ${item.yourAnswer}<br>
                    <strong>Correct answer:</strong> ${item.correctAnswer}<br>
                    <em>${item.explanation}</em>
                `;
                checkpointWrongList.appendChild(div);
            });
        } else if (checkpointWrongAnswers) {
            checkpointWrongAnswers.classList.add('hidden');
        }
    }
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
 * カテゴリーリトライ
 */
function retryCategoryQuiz() {
    completedCategories.delete(currentCategory.id);
    startCategory(currentCategory);
}

/**
 * 次のカテゴリーまたは最終結果
 */
function goToNextCategory() {
    if (completedCategories.size === categories.length) {
        showFinalResults();
    } else {
        if (checkpointScreen) checkpointScreen.classList.remove('active');
        if (categoryScreen) categoryScreen.classList.add('active');
        displayCategories();
    }
}

/**
 * カテゴリー選択に戻る
 */
function backToCategorySelection() {
    if (checkpointScreen) checkpointScreen.classList.remove('active');
    if (categoryScreen) categoryScreen.classList.add('active');
    displayCategories();
}

/**
 * 最終結果表示
 */
function showFinalResults() {
    console.log('🎊 Quiz Complete!');
    
    // 新HTML
    if (resultSection) {
        if (quizSection) quizSection.classList.add('hidden');
        if (checkpointScreen) checkpointScreen.classList.remove('active');
        resultSection.classList.remove('hidden');
        
        const totalQuestionsElem = document.getElementById('total-questions');
        const correctAnswersElem = document.getElementById('correct-answers');
        const finalScoreElem = document.getElementById('final-score');
        
        if (totalQuestionsElem) {
            totalQuestionsElem.textContent = totalQuestions;
        }
        
        if (correctAnswersElem) {
            correctAnswersElem.textContent = totalScore;
        }
        
        if (finalScoreElem && totalQuestions > 0) {
            const finalScorePercent = Math.round((totalScore / totalQuestions) * 100);
            finalScoreElem.textContent = finalScorePercent + '%';
        }
    }
    
    // 旧HTML
    if (resultScreen) {
        if (checkpointScreen) checkpointScreen.classList.remove('active');
        resultScreen.classList.add('active');
        
        const accuracyPercent = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
        
        if (finalScore) {
            finalScore.textContent = `${totalScore}/${totalQuestions}`;
        }
        
        if (accuracy) {
            accuracy.textContent = `${accuracyPercent}%`;
        }
        
        if (completedCount) {
            completedCount.textContent = `${completedCategories.size}/${categories.length}`;
        }
    }
}

/**
 * リセットして最初から
 */
function startOver() {
    completedCategories.clear();
    totalScore = 0;
    totalQuestions = 0;
    currentQuestionIndex = 0;
    categoryScore = 0;
    categoryWrongAnswers = [];
    
    console.log('🔄 Quiz reset');
    
    // 新HTML
    if (resultSection) resultSection.classList.add('hidden');
    if (startSection) startSection.classList.remove('hidden');
    
    // 旧HTML
    if (resultScreen) resultScreen.classList.remove('active');
    if (startScreen) startScreen.classList.add('active');
    
    displayCategories();
}

/**
 * 音声読み上げ
 */
function speak(text) {
    if (!currentCategory || currentQuestionIndex >= currentCategory.questions.length) {
        console.error('No current question available');
        return;
    }
    
    const currentQuestion = currentCategory.questions[currentQuestionIndex];
    const audioPath = `assets/audio/word_${currentQuestion.id}.mp3`;
    
    console.log(`🔊 Playing audio: ${audioPath}`);
    
    // ボタン無効化
    if (speakBtn) {
        speakBtn.disabled = true;
        speakBtn.textContent = '🔊 Playing...';
    }
    
    // 音声ファイル再生
    const audio = new Audio(audioPath);
    
    audio.addEventListener('ended', () => {
        if (speakBtn) {
            speakBtn.disabled = false;
            speakBtn.textContent = '🔊 Listen Again';
        }
    });
    
    audio.addEventListener('error', (error) => {
        console.warn('⚠️ Audio file not found, using Web Speech API fallback');
        
        if (speakBtn) {
            speakBtn.disabled = false;
            speakBtn.textContent = '🔊 Listen Again';
        }
        
        // フォールバック: Web Speech API
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-GB';
            utterance.rate = 0.85;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            utterance.addEventListener('end', () => {
                if (speakBtn) {
                    speakBtn.disabled = false;
                    speakBtn.textContent = '🔊 Listen Again';
                }
            });
            
            const setVoice = () => {
                const voices = speechSynthesis.getVoices();
                const ukVoice = voices.find(voice => 
                    voice.lang === 'en-GB' && 
                    (voice.name.includes('Google') || voice.name.includes('Microsoft'))
                );
                
                if (ukVoice) {
                    utterance.voice = ukVoice;
                }
                
                speechSynthesis.speak(utterance);
            };
            
            if (speechSynthesis.getVoices().length > 0) {
                setVoice();
            } else {
                speechSynthesis.addEventListener('voiceschanged', setVoice, { once: true });
            }
        }
    });
    
    audio.play();
}