// Global variables
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let wrongAnswers = [];
let isReviewMode = false;

// DOM elements
const startScreen = document.getElementById('startScreen');
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');
const startBtn = document.getElementById('startBtn');
const speakBtn = document.getElementById('speakBtn');
const nextBtn = document.getElementById('nextBtn');
const retryBtn = document.getElementById('retryBtn');
const reviewBtn = document.getElementById('reviewBtn');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const feedback = document.getElementById('feedback');
const feedbackText = document.getElementById('feedbackText');
const explanation = document.getElementById('explanation');
const currentQuestionSpan = document.getElementById('currentQuestion');
const totalQuestionsSpan = document.getElementById('totalQuestions');
const progressFill = document.getElementById('progressFill');
const finalScore = document.getElementById('finalScore');
const accuracy = document.getElementById('accuracy');
const wrongAnswersSection = document.getElementById('wrongAnswersSection');
const wrongAnswersList = document.getElementById('wrongAnswersList');

// Load questions
async function loadQuestions() {
    try {
        const response = await fetch('data/questions.json');
        questions = await response.json();
        
        // Shuffle questions
        questions = shuffleArray(questions);
        
        totalQuestionsSpan.textContent = questions.length;
    } catch (error) {
        console.error('Error loading questions:', error);
        alert('Failed to load questions. Please refresh the page.');
    }
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

// Start quiz
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    wrongAnswers = [];
    isReviewMode = false;
    
    startScreen.classList.remove('active');
    quizScreen.classList.add('active');
    
    displayQuestion();
}

// Display question
function displayQuestion() {
    const question = questions[currentQuestionIndex];
    
    // Update progress
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
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
        btn.addEventListener('click', () => selectAnswer(option, question.correctAnswer));
        optionsContainer.appendChild(btn);
    });
    
    // Hide feedback and next button
    feedback.classList.add('hidden');
    nextBtn.classList.add('hidden');
}

// Select answer
function selectAnswer(selected, correct) {
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
        score++;
        feedback.className = 'feedback correct';
        feedbackText.textContent = '✓ Correct!';
    } else {
        feedback.className = 'feedback wrong';
        feedbackText.textContent = '✗ Incorrect';
        
        wrongAnswers.push({
            question: questions[currentQuestionIndex].question,
            yourAnswer: selected,
            correctAnswer: correct,
            explanation: questions[currentQuestionIndex].explanation
        });
    }
    
    explanation.textContent = questions[currentQuestionIndex].explanation;
    
    // Show next button
    nextBtn.classList.remove('hidden');
}

// Next question
function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    } else {
        showResults();
    }
}

// Show results
function showResults() {
    quizScreen.classList.remove('active');
    resultScreen.classList.add('active');
    
    const totalQuestions = questions.length;
    const accuracyPercent = Math.round((score / totalQuestions) * 100);
    
    finalScore.textContent = `${score}/${totalQuestions}`;
    accuracy.textContent = `${accuracyPercent}%`;
    
    // Show wrong answers if any
    if (wrongAnswers.length > 0) {
        wrongAnswersSection.classList.remove('hidden');
        reviewBtn.classList.remove('hidden');
        
        wrongAnswersList.innerHTML = '';
        wrongAnswers.forEach(item => {
            const div = document.createElement('div');
            div.className = 'wrong-answer-item';
            div.innerHTML = `
                <strong>Question:</strong> ${item.question}<br>
                <strong>Your answer:</strong> ${item.yourAnswer}<br>
                <strong>Correct answer:</strong> ${item.correctAnswer}<br>
                <em>${item.explanation}</em>
            `;
            wrongAnswersList.appendChild(div);
        });
    } else {
        wrongAnswersSection.classList.add('hidden');
        reviewBtn.classList.add('hidden');
    }
}

// Retry quiz
function retryQuiz() {
    questions = shuffleArray(questions);
    resultScreen.classList.remove('active');
    startQuiz();
}

// Review wrong answers
function reviewWrongAnswers() {
    if (wrongAnswers.length === 0) return;
    
    // Create review questions from wrong answers
    questions = wrongAnswers.map(item => {
        const originalQuestion = questions.find(q => q.question === item.question);
        return originalQuestion;
    });
    
    questions = shuffleArray(questions);
    isReviewMode = true;
    
    resultScreen.classList.remove('active');
    startQuiz();
}

// Text to speech
function speak(text) {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-GB';
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
    }
}

// Event listeners
startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', nextQuestion);
retryBtn.addEventListener('click', retryQuiz);
reviewBtn.addEventListener('click', reviewWrongAnswers);
speakBtn.addEventListener('click', () => speak(questionText.textContent));

// Initialize
loadQuestions();
