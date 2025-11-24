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
const startScreen = document.getElementById('startScreen');
const categoryScreen = document.getElementById('categoryScreen');
const quizScreen = document.getElementById('quizScreen');
const checkpointScreen = document.getElementById('checkpointScreen');
const resultScreen = document.getElementById('resultScreen');

const selectCategoryBtn = document.getElementById('selectCategoryBtn');
const backToStartBtn = document.getElementById('backToStartBtn');
const categoryList = document.getElementById('categoryList');
const categoryTitle = document.getElementById('categoryTitle');

const speakBtn = document.getElementById('speakBtn');
const nextBtn = document.getElementById('nextBtn');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const feedback = document.getElementById('feedback');
const feedbackText = document.getElementById('feedbackText');
const explanation = document.getElementById('explanation');
const currentQuestionSpan = document.getElementById('currentQuestion');
const totalQuestionsSpan = document.getElementById('totalQuestions');
const progressFill = document.getElementById('progressFill');

const completedCategory = document.getElementById('completedCategory');
const checkpointScore = document.getElementById('checkpointScore');
const checkpointAccuracy = document.getElementById('checkpointAccuracy');
const checkpointWrongAnswers = document.getElementById('checkpointWrongAnswers');
const checkpointWrongList = document.getElementById('checkpointWrongList');
const retryCategory = document.getElementById('retryCategory');
const nextCategory = document.getElementById('nextCategory');
const backToCategories = document.getElementById('backToCategories');

const finalScore = document.getElementById('finalScore');
const accuracy = document.getElementById('accuracy');
const completedCount = document.getElementById('completedCount');
const startOverBtn = document.getElementById('startOverBtn');

// Quick Start用の要素
const categorySelect = document.getElementById('categorySelect');
const startQuickBtn = document.getElementById('startQuickBtn');

// Load questions
async function loadQuestions() {
    try {
        const response = await fetch('data/questions.json');
        allQuestions = await response.json();
        
        // Group questions by category
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
            },
            {
                id: 16,
                name: 'Machine Learning',
                description: 'AI and ML vocabulary',
                icon: '🤖',
                questions: allQuestions.filter(q => q.category === 'machine-learning')
            },
            {
                id: 17,
                name: 'Daily Conversation',
                description: 'Everyday communication',
                icon: '💬',
                questions: allQuestions.filter(q => q.category === 'daily-conversation')
            },
            {
                id: 18,
                name: 'Food & Dining',
                description: 'Restaurant and food terms',
                icon: '🍽️',
                questions: allQuestions.filter(q => q.category === 'food-dining')
            },
            {
                id: 19,
                name: 'Travel & Transportation',
                description: 'Journey and transit vocabulary',
                icon: '✈️',
                questions: allQuestions.filter(q => q.category === 'travel-transportation')
            },
            {
                id: 20,
                name: 'Technology & Digital',
                description: 'Digital world terminology',
                icon: '💻',
                questions: allQuestions.filter(q => q.category === 'technology-digital')
            },
            {
                id: 21,
                name: 'Advanced Business Strategy',
                description: 'Strategic management terminology',
                icon: '🎯',
                questions: allQuestions.filter(q => q.category === 'advanced-business')
            },
            {
                id: 22,
                name: 'Executive Leadership',
                description: 'Leadership and management terms',
                icon: '👔',
                questions: allQuestions.filter(q => q.category === 'executive-leadership')
            },
            {
                id: 23,
                name: 'Drug Development Process',
                description: 'Advanced pharmaceutical R&D',
                icon: '🧬',
                questions: allQuestions.filter(q => q.category === 'drug-development')
            },
            {
                id: 24,
                name: 'Regulatory Affairs',
                description: 'Regulatory compliance vocabulary',
                icon: '📋',
                questions: allQuestions.filter(q => q.category === 'regulatory-affairs')
            },
            {
                id: 25,
                name: 'Advanced Analytics',
                description: 'Sophisticated data analysis',
                icon: '📊',
                questions: allQuestions.filter(q => q.category === 'advanced-analytics')
            },
            {
                id: 26,
                name: 'AI & Deep Learning',
                description: 'Cutting-edge AI technology',
                icon: '🧠',
                questions: allQuestions.filter(q => q.category === 'ai-deep-learning')
            },
            {
                id: 27,
                name: 'Formal Communication',
                description: 'Professional formal expressions',
                icon: '📝',
                questions: allQuestions.filter(q => q.category === 'formal-communication')
            },
            {
                id: 28,
                name: 'Academic & Research',
                description: 'Scholarly terminology',
                icon: '🎓',
                questions: allQuestions.filter(q => q.category === 'academic-research')
            },
            {
                id: 29,
                name: 'Finance & Economics',
                description: 'Financial and economic terms',
                icon: '💰',
                questions: allQuestions.filter(q => q.category === 'finance-economics')
            },
            {
                id: 30,
                name: 'Legal & Compliance',
                description: 'Legal and regulatory language',
                icon: '⚖️',
                questions: allQuestions.filter(q => q.category === 'legal-compliance')
            },
            {
                id: 31,
                name: 'Corporate Governance',
                description: 'Corporate oversight terminology',
                icon: '🏢',
                questions: allQuestions.filter(q => q.category === 'corporate-governance')
            },
            {
                id: 32,
                name: 'Quality Assurance',
                description: 'QA and quality control terms',
                icon: '✅',
                questions: allQuestions.filter(q => q.category === 'quality-assurance')
            },
            {
                id: 33,
                name: 'Bioinformatics',
                description: 'Computational biology vocabulary',
                icon: '🧬',
                questions: allQuestions.filter(q => q.category === 'bioinformatics')
            },
            {
                id: 34,
                name: 'Pharmacoeconomics',
                description: 'Health economics terminology',
                icon: '💊',
                questions: allQuestions.filter(q => q.category === 'pharmacoeconomics')
            },
            {
                id: 35,
                name: 'Statistical Analysis',
                description: 'Advanced statistical methods',
                icon: '📉',
                questions: allQuestions.filter(q => q.category === 'statistical-analysis')
            },
            {
                id: 36,
                name: 'Natural Language Processing',
                description: 'NLP and linguistics terms',
                icon: '🗣️',
                questions: allQuestions.filter(q => q.category === 'nlp')
            },
            {
                id: 37,
                name: 'Negotiation & Diplomacy',
                description: 'Diplomatic communication',
                icon: '🤝',
                questions: allQuestions.filter(q => q.category === 'negotiation-diplomacy')
            },
            {
                id: 38,
                name: 'Scientific Research',
                description: 'Research methodology terms',
                icon: '🔬',
                questions: allQuestions.filter(q => q.category === 'scientific-research')
            },
            {
                id: 39,
                name: 'Risk Management',
                description: 'Risk assessment vocabulary',
                icon: '⚠️',
                questions: allQuestions.filter(q => q.category === 'risk-management')
            },
            {
                id: 40,
                name: 'Intellectual Discourse',
                description: 'Philosophical and logical terms',
                icon: '💭',
                questions: allQuestions.filter(q => q.category === 'intellectual-discourse')
            }
                        ,
            {
                id: 41,
                name: 'Project Management',
                description: 'Project planning and execution',
                icon: '📋',
                questions: allQuestions.filter(q => q.category === 'project-management')
            },
            {
                id: 42,
                name: 'Supply Chain & Logistics',
                description: 'Supply chain operations',
                icon: '🚚',
                questions: allQuestions.filter(q => q.category === 'supply-chain')
            },
            {
                id: 43,
                name: 'Medical Terminology',
                description: 'Healthcare and medical terms',
                icon: '🏥',
                questions: allQuestions.filter(q => q.category === 'medical-terminology')
            },
            {
                id: 44,
                name: 'Laboratory Procedures',
                description: 'Lab techniques and methods',
                icon: '🧪',
                questions: allQuestions.filter(q => q.category === 'laboratory-procedures')
            },
            {
                id: 45,
                name: 'Database & SQL',
                description: 'Database management terms',
                icon: '🗄️',
                questions: allQuestions.filter(q => q.category === 'database-sql')
            },
            {
                id: 46,
                name: 'Cloud Computing',
                description: 'Cloud infrastructure vocabulary',
                icon: '☁️',
                questions: allQuestions.filter(q => q.category === 'cloud-computing')
            },
            {
                id: 47,
                name: 'Social Interactions',
                description: 'Social and interpersonal terms',
                icon: '👥',
                questions: allQuestions.filter(q => q.category === 'social-interactions')
            },
            {
                id: 48,
                name: 'Weather & Nature',
                description: 'Environmental vocabulary',
                icon: '🌤️',
                questions: allQuestions.filter(q => q.category === 'weather-nature')
            },
            {
                id: 49,
                name: 'Ethics & Morality',
                description: 'Moral and ethical concepts',
                icon: '⚖️',
                questions: allQuestions.filter(q => q.category === 'ethics-morality')
            },
            {
                id: 50,
                name: 'Innovation & Creativity',
                description: 'Creative thinking vocabulary',
                icon: '💡',
                questions: allQuestions.filter(q => q.category === 'innovation-creativity')
            }

        ];
        
        displayCategories();
        populateCategoryDropdown();
    } catch (error) {
        console.error('Error loading questions:', error);
        alert('Failed to load questions. Please refresh the page.');
    }
}

// Populate category dropdown
function populateCategoryDropdown() {
    categorySelect.innerHTML = '<option value="">-- Choose a category --</option>';
    
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = `${cat.id}. ${cat.icon} ${cat.name}`;
        categorySelect.appendChild(option);
    });
}

// Handle category selection from dropdown
function handleCategorySelection() {
    const selectedId = parseInt(categorySelect.value);
    if (selectedId) {
        startQuickBtn.disabled = false;
    } else {
        startQuickBtn.disabled = true;
    }
}

// Start quiz from dropdown selection
function startQuickQuiz() {
    const selectedId = parseInt(categorySelect.value);
    if (!selectedId) return;
    
    const selectedCategory = categories.find(cat => cat.id === selectedId);
    if (selectedCategory) {
        startCategory(selectedCategory);
    }
}

// Display categories
function displayCategories() {
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
}

// Start category
function startCategory(category) {
    currentCategory = category;
    currentQuestionIndex = 0;
    categoryScore = 0;
    categoryWrongAnswers = [];
    
    // Shuffle questions within category
    currentCategory.questions = shuffleArray(currentCategory.questions);
    
    startScreen.classList.remove('active');
    categoryScreen.classList.remove('active');
    quizScreen.classList.add('active');
    
    categoryTitle.textContent = `${currentCategory.icon} ${currentCategory.name}`;
    totalQuestionsSpan.textContent = currentCategory.questions.length;
    
    displayQuestion();
}

// Shuffle array
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}
// Display question
function displayQuestion() {
    const question = currentCategory.questions[currentQuestionIndex];
    
    // Update progress
    const progress = ((currentQuestionIndex + 1) / currentCategory.questions.length) * 100;
    progressFill.style.width = progress + '%';
    currentQuestionSpan.textContent = currentQuestionIndex + 1;
    
    // Display question
    questionText.textContent = question.question;
    
    // Clear and display options
    optionsContainer.innerHTML = '';
    const shuffledOptions = shuffleArray(question.options);
    
    shuffledOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.addEventListener('click', () => selectAnswer(option, question.correctAnswer, question.explanation));
        optionsContainer.appendChild(btn);
    });
    
    // Hide feedback and next button
    feedback.classList.add('hidden');
    nextBtn.classList.add('hidden');
    
    // 音声ボタンを有効化
    speakBtn.disabled = false;
    speakBtn.textContent = '🔊 Listen Again';
}



// Select answer
function selectAnswer(selected, correct, explanationText) {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    const isCorrect = selected === correct;
    
    buttons.forEach(btn => {
        if (btn.textContent === correct) {
            btn.classList.add('correct');
        }
        if (btn.textContent === selected && !isCorrect) {
            btn.classList.add('wrong');
        }
    });
    
    // Show feedback
    feedback.classList.remove('hidden');
    if (isCorrect) {
        categoryScore++;
        totalScore++;
        feedback.className = 'feedback correct';
        feedbackText.textContent = '✓ Correct!';
    } else {
        feedback.className = 'feedback wrong';
        feedbackText.textContent = '✗ Incorrect';
        
        categoryWrongAnswers.push({
            question: currentCategory.questions[currentQuestionIndex].question,
            yourAnswer: selected,
            correctAnswer: correct,
            explanation: explanationText
        });
    }
    
    explanation.textContent = explanationText;
    totalQuestions++;
    
    // Show next button
    nextBtn.classList.remove('hidden');
}

// Next question
function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < currentCategory.questions.length) {
        displayQuestion();
    } else {
        showCheckpoint();
    }
}

// Show checkpoint (after 10 questions)
function showCheckpoint() {
    quizScreen.classList.remove('active');
    checkpointScreen.classList.add('active');
    
    completedCategory.textContent = `${currentCategory.icon} ${currentCategory.name}`;
    const accuracyPercent = Math.round((categoryScore / currentCategory.questions.length) * 100);
    
    checkpointScore.textContent = `${categoryScore}/${currentCategory.questions.length}`;
    checkpointAccuracy.textContent = `${accuracyPercent}%`;
    
    // Mark category as completed
    completedCategories.add(currentCategory.id);
    
    // Show wrong answers if any
    if (categoryWrongAnswers.length > 0) {
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
    } else {
        checkpointWrongAnswers.classList.add('hidden');
    }
    
    // Check if all categories completed
    if (completedCategories.size === categories.length) {
        nextCategory.textContent = 'View Final Results';
    } else {
        nextCategory.textContent = 'Next Category';
    }
}

// Retry current category
function retryCategoryQuiz() {
    completedCategories.delete(currentCategory.id);
    startCategory(currentCategory);
}

// Next category or final results
function goToNextCategory() {
    if (completedCategories.size === categories.length) {
        showFinalResults();
    } else {
        checkpointScreen.classList.remove('active');
        categoryScreen.classList.add('active');
        displayCategories();
    }
}

// Back to category selection
function backToCategorySelection() {
    checkpointScreen.classList.remove('active');
    categoryScreen.classList.add('active');
    displayCategories();
}

// Show final results
function showFinalResults() {
    checkpointScreen.classList.remove('active');
    resultScreen.classList.add('active');
    
    const accuracyPercent = Math.round((totalScore / totalQuestions) * 100);
    
    finalScore.textContent = `${totalScore}/${totalQuestions}`;
    accuracy.textContent = `${accuracyPercent}%`;
    completedCount.textContent = `${completedCategories.size}/${categories.length}`;
}

// Start over
function startOver() {
    completedCategories.clear();
    totalScore = 0;
    totalQuestions = 0;
    
    resultScreen.classList.remove('active');
    startScreen.classList.add('active');
    
    displayCategories();
}

// Text to speech
// Text to speech - Pre-generated audio files (改良版)
function speak(text) {
    if (!currentCategory || currentQuestionIndex >= currentCategory.questions.length) {
        console.error('No current question available');
        return;
    }
    
    // 現在の問題IDを取得
    const currentQuestion = currentCategory.questions[currentQuestionIndex];
    const audioPath = `assets/audio/word_${currentQuestion.id}.mp3`;
    
    console.log(`Playing audio: ${audioPath}`);
    
    // ボタンを一時的に無効化（連打防止）
    speakBtn.disabled = true;
    speakBtn.textContent = '🔊 Playing...';
    
    // 音声ファイルを再生
    const audio = new Audio(audioPath);
    
    audio.addEventListener('ended', () => {
        speakBtn.disabled = false;
        speakBtn.textContent = '🔊 Listen Again';
    });
    
    audio.addEventListener('error', (error) => {
        speakBtn.disabled = false;
        speakBtn.textContent = '🔊 Listen Again';
        console.error('Audio playback error:', error);
        console.log('Falling back to Web Speech API');
        
        // フォールバック: Web Speech API
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-GB';
            utterance.rate = 0.85;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            utterance.addEventListener('end', () => {
                speakBtn.disabled = false;
                speakBtn.textContent = '🔊 Listen Again';
            });
            
            // 音声の取得を待つ
            const setVoice = () => {
                const voices = speechSynthesis.getVoices();
                const ukVoice = voices.find(voice => 
                    voice.lang === 'en-GB' && 
                    (voice.name.includes('Google') || 
                     voice.name.includes('Microsoft'))
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



// Event listeners
selectCategoryBtn.addEventListener('click', () => {
    startScreen.classList.remove('active');
    categoryScreen.classList.add('active');
});

backToStartBtn.addEventListener('click', () => {
    categoryScreen.classList.remove('active');
    startScreen.classList.add('active');
});

nextBtn.addEventListener('click', nextQuestion);
retryCategory.addEventListener('click', retryCategoryQuiz);
nextCategory.addEventListener('click', goToNextCategory);
backToCategories.addEventListener('click', backToCategorySelection);
startOverBtn.addEventListener('click', startOver);
speakBtn.addEventListener('click', () => speak(questionText.textContent));

// Quick Start event listeners
categorySelect.addEventListener('change', handleCategorySelection);
startQuickBtn.addEventListener('click', startQuickQuiz);

// Initialize
loadQuestions();



/**
 * ============================================
 * 既存の app.js の最後に以下のコードを追加してください
 * ============================================
 */

// スタート画面とクイズセクションの制御を追加
document.addEventListener('DOMContentLoaded', function() {
    // 既存のコードはそのまま残す

    // === 新規追加: モード選択ボタン ===
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const startSection = document.getElementById('start-section');
    const quizSection = document.getElementById('quiz-section');

    // クイズモード開始ボタン
    if (startQuizBtn) {
        startQuizBtn.addEventListener('click', function() {
            startSection.classList.add('hidden');
            quizSection.classList.remove('hidden');
            
            // 既存のクイズ初期化関数を呼び出し（もしあれば）
            if (typeof startQuiz === 'function') {
                startQuiz();
            } else if (typeof loadQuestion === 'function') {
                loadQuestion(0); // 最初の問題をロード
            }
        });
    }

    // Back to Menuボタン（既存のクイズから戻る）
    const backToMenuQuiz = document.getElementById('back-to-menu');
    if (backToMenuQuiz) {
        backToMenuQuiz.addEventListener('click', function() {
            quizSection.classList.add('hidden');
            startSection.classList.remove('hidden');
            
            // クイズをリセット（もしリセット関数があれば）
            if (typeof resetQuiz === 'function') {
                resetQuiz();
            }
        });
    }

    // === Quick Start機能（既存のコード用） ===
    // カテゴリー選択のポピュレート（既存のquestions.jsonベース）
    const categorySelect = document.getElementById('category-select');
    const quickStartBtn = document.getElementById('quick-start-btn');

    // もし questions配列がグローバルにある場合
    if (typeof questions !== 'undefined' && categorySelect) {
        populateCategoryDropdown();
    }

    function populateCategoryDropdown() {
        const categories = [...new Set(questions.map(q => q.category))];
        
        categories.forEach((category, index) => {
            const option = document.createElement('option');
            option.value = index + 1;
            option.textContent = `Category ${index + 1}: ${category}`;
            categorySelect.appendChild(option);
        });
    }

    if (quickStartBtn) {
        quickStartBtn.addEventListener('click', function() {
            const selectedCategory = categorySelect.value;
            if (!selectedCategory) {
                alert('Please select a category first.');
                return;
            }

            // カテゴリーに対応する問題番号を計算（1カテゴリー=10問と仮定）
            const startQuestionIndex = (parseInt(selectedCategory) - 1) * 10;

            // スタート画面を非表示、クイズセクションを表示
            startSection.classList.add('hidden');
            quizSection.classList.remove('hidden');

            // その問題番号から開始（既存の関数を使用）
            if (typeof loadQuestion === 'function') {
                currentQuestionIndex = startQuestionIndex;
                loadQuestion(currentQuestionIndex);
            } else if (typeof jumpToQuestion === 'function') {
                jumpToQuestion(startQuestionIndex);
            }

            console.log('📌 Quick Start: Jumping to question', startQuestionIndex + 1);
        });
    }
});