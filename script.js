import { GoogleGenAI, Type } from "@google/genai";

// --- CONFIGURATION & CONSTANTS ---
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    console.warn("API_KEY environment variable not set. API calls will fail.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const TOTAL_LEVELS = 30;
const QUESTIONS_PER_QUIZ = 10;
const SCORE_TO_UNLOCK_NEXT_LEVEL = 6;

const Screen = {
    WELCOME: 'welcome-screen',
    AUTH: 'auth-screen',
    HOME: 'home-screen',
    LEVEL: 'level-screen',
    QUIZ: 'quiz-screen',
    RESULTS: 'results-screen',
    PROFILE: 'profile-screen',
};

const TOPICS = [
    { id: 'ai_robotics', title: 'AI & Robotics', description: 'Explore neural networks, machine learning, and automation.', icon: '🧠' },
    { id: 'biology', title: 'Biology', description: 'Uncover the secrets of life, from DNA to ecosystems.', icon: '🧬' },
    { id: 'programming', title: 'Programming', description: 'Test your knowledge of algorithms, data structures, and languages.', icon: '💻' },
    { id: 'physics', title: 'Physics', description: 'Journey from classical mechanics to quantum phenomena.', icon: '⚛️' },
    { id: 'chemistry', title: 'Chemistry', description: 'Dive into molecular structures, reactions, and the elements.', icon: '🧪' },
    { id: 'mathematics', title: 'Mathematics', description: 'Challenge your mind with logic, calculus, and theorems.', icon: '🧮' },
    { id: 'islamic_quiz', title: 'Islamic Quiz', description: 'Deepen your understanding of Islamic history and teachings.', icon: '🕌' },
    { id: 'world_knowledge', title: 'World Knowledge', description: 'A test of general knowledge about our world.', icon: '🌍' },
    { id: 'cos_space', title: 'Space & Astronomy', description: 'Explore the cosmos, from planets to distant galaxies.', icon: '🔭' },
];

// --- DOM ELEMENT CACHE ---
const dom = {
    appContainer: document.getElementById('app-container'),
    screens: document.querySelectorAll('.screen'),
    loadingOverlay: document.getElementById('loading-overlay'),
    loadingText: document.getElementById('loading-text'),
    appHeader: document.getElementById('app-header'),
    appFooter: document.getElementById('app-footer'),
    headerNavContainer: document.getElementById('header-nav-container'),
    matrixCanvas: document.getElementById('matrix-canvas'),
};

// --- APPLICATION STATE ---
let state = {
    currentScreen: null,
    currentTopic: null,
    currentLevel: 1,
    userProgress: {},
    lastScore: 0,
    quiz: {
        questions: [],
        currentQuestionIndex: 0,
        selectedAnswer: null,
        score: 0,
        answerSubmitted: false,
        timerId: null,
    }
};

// --- QUIZ HELPERS ---
const getDifficulty = (level) => {
    if (level <= 10) return 'easy';
    if (level <= 20) return 'medium';
    if (level <= 28) return 'hard';
    return 'expert';
};

const getTimerDuration = (difficulty) => {
    switch (difficulty) {
        case 'easy': return 50;
        case 'medium': return 40;
        case 'hard': return 30;
        case 'expert': return 20;
        default: return 30;
    }
};


// --- GEMINI API SERVICE ---
const quizQuestionSchema = {
    type: Type.OBJECT,
    properties: {
        question: { type: Type.STRING, description: "The quiz question text." },
        options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of exactly 4 string options." },
        correctAnswerIndex: { type: Type.INTEGER, description: "The 0-based index of the correct answer in the options array." },
    },
    required: ['question', 'options', 'correctAnswerIndex'],
};

const generateQuizQuestions = async (topicTitle, level) => {
    try {
        const difficulty = getDifficulty(level);
        const prompt = `Generate a quiz with ${QUESTIONS_PER_QUIZ} multiple-choice questions about "${topicTitle}". The difficulty must be ${difficulty} (level ${level}/${TOTAL_LEVELS}). Each question needs exactly 4 options. Ensure questions are distinct and relevant.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { questions: { type: Type.ARRAY, items: quizQuestionSchema } },
                    required: ['questions'],
                },
            },
        });
        
        const result = JSON.parse(response.text);
        if (result.questions && Array.isArray(result.questions) && result.questions.every(q => q.options.length === 4)) {
            return result.questions;
        }
        throw new Error("API returned malformed data.");
    } catch (error) {
        console.error("Error generating quiz questions:", error);
        return getMockQuestions(topicTitle); // Fallback to mock data
    }
};

const generateAiFeedback = async (topicTitle, score) => {
    try {
        const prompt = `A user scored ${score}/${QUESTIONS_PER_QUIZ} on a quiz about "${topicTitle}". Provide a brief, encouraging, and constructive feedback message (2-3 sentences).`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error generating AI feedback:", error);
        return "Great effort! Keep practicing to master this topic.";
    }
};

// --- MOCK DATA FALLBACK ---
const getMockQuestions = (topic) => {
    console.warn("Using mock questions due to API failure or offline mode.");
    return Array.from({ length: QUESTIONS_PER_QUIZ }, (_, i) => ({
        question: `This is mock question #${i + 1} for ${topic}. What is the correct option?`,
        options: ["Mock Option A", "Mock Option B", "Mock Option C", "Mock Option D"],
        correctAnswerIndex: i % 4,
    }));
};

// --- RENDERING LOGIC ---
const renderHomeScreen = () => {
    const topicGrid = document.getElementById('topic-grid');
    topicGrid.innerHTML = TOPICS.map(topic => `
        <div class="topic-card" data-topic-id="${topic.id}">
            <div class="icon">${topic.icon}</div>
            <h3>${topic.title}</h3>
            <p>${topic.description}</p>
        </div>
    `).join('');

    document.querySelectorAll('.topic-card').forEach(card => {
        card.addEventListener('click', () => {
            state.currentTopic = TOPICS.find(t => t.id === card.dataset.topicId);
            navigateTo(Screen.LEVEL);
        });
    });
};

const renderLevelScreen = () => {
    document.getElementById('level-topic-title').textContent = state.currentTopic.title;
    const progress = state.userProgress[state.currentTopic.id] || { highestLevelUnlocked: 1 };
    const completion = Math.floor(((progress.highestLevelUnlocked - 1) / TOTAL_LEVELS) * 100);

    document.getElementById('level-progress-text').textContent = `Level ${progress.highestLevelUnlocked} of ${TOTAL_LEVELS} (${completion}%)`;
    document.getElementById('level-progress-bar').style.width = `${completion}%`;

    const levelGrid = document.getElementById('level-grid');
    levelGrid.innerHTML = Array.from({ length: TOTAL_LEVELS }, (_, i) => {
        const level = i + 1;
        const isUnlocked = level <= progress.highestLevelUnlocked;
        const isCompleted = level < progress.highestLevelUnlocked;
        const statusClass = isCompleted ? 'completed' : isUnlocked ? 'unlocked' : 'locked';
        return `
            <div class="level-btn ${statusClass}" data-level="${level}">
                <div class="level-number">${level}</div>
                <div class="level-status">${isCompleted ? 'Done' : isUnlocked ? 'Open' : 'Locked'}</div>
            </div>
        `;
    }).join('');
    
    levelGrid.querySelectorAll('.unlocked, .completed').forEach(btn => {
        btn.addEventListener('click', () => {
            state.currentLevel = parseInt(btn.dataset.level, 10);
            navigateTo(Screen.QUIZ);
        });
    });

    document.getElementById('current-level-text').textContent = progress.highestLevelUnlocked;
};

const renderQuizQuestion = () => {
    const { questions, currentQuestionIndex } = state.quiz;
    const question = questions[currentQuestionIndex];
    
    document.getElementById('question-counter').textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    document.getElementById('quiz-progress-bar').style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;
    document.getElementById('question-text').textContent = question.question;

    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = ''; // Clear previous options

    question.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.dataset.index = index;
        btn.textContent = option;
        
        btn.addEventListener('click', () => {
            if (state.quiz.answerSubmitted) return;
            state.quiz.selectedAnswer = parseInt(btn.dataset.index, 10);
            document.querySelectorAll('.option-btn.selected').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
        
        optionsContainer.appendChild(btn);
    });

    document.getElementById('quiz-action-buttons').innerHTML = `<button id="submit-answer-btn" class="btn btn-primary">Submit</button>`;
};

const renderQuizResult = () => {
    stopTimer();
    const { questions, currentQuestionIndex, selectedAnswer } = state.quiz;
    const question = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === question.correctAnswerIndex;
    if(isCorrect) state.quiz.score++;

    document.querySelectorAll('.option-btn').forEach((btn) => {
        const index = parseInt(btn.dataset.index, 10);
        btn.disabled = true;
        if (index === question.correctAnswerIndex) btn.classList.add('correct');
        else if (index === selectedAnswer) btn.classList.add('incorrect');
    });

    const nextText = currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz';
    document.getElementById('quiz-action-buttons').innerHTML = `<button id="next-question-btn" class="btn btn-primary">${nextText}</button>`;
};

const renderResultsScreen = () => {
    document.getElementById('results-topic-text').textContent = `Performance for ${state.currentTopic.title} - Level ${state.currentLevel}`;
    document.getElementById('final-score-value').textContent = state.lastScore;
    document.getElementById('total-questions-value').textContent = QUESTIONS_PER_QUIZ;
    document.getElementById('correct-answers').textContent = state.lastScore;
    document.getElementById('incorrect-answers').textContent = QUESTIONS_PER_QUIZ - state.lastScore;

    const unlocked = state.lastScore >= SCORE_TO_UNLOCK_NEXT_LEVEL;
    const unlockMsg = document.getElementById('unlock-message');
    unlockMsg.classList.toggle('hidden', !unlocked);
    if(unlocked) unlockMsg.textContent = state.currentLevel < TOTAL_LEVELS ? 'Level Unlocked!' : 'All Levels Cleared!';
    
    document.getElementById('results-action-buttons').innerHTML = `
        ${unlocked && state.currentLevel < TOTAL_LEVELS ? '<button id="next-level-btn" class="btn btn-primary">Next Level</button>' : ''}
        <button id="retry-btn" class="btn btn-secondary">Retry Level</button>
        <button id="home-btn" class="btn btn-secondary">Topics</button>
    `;

    const feedbackText = document.getElementById('ai-feedback-text');
    feedbackText.textContent = 'Generating feedback...';
    generateAiFeedback(state.currentTopic.title, state.lastScore).then(fb => feedbackText.textContent = fb);
};

const renderProfileScreen = () => {
    const stats = Object.values(state.userProgress).reduce((acc, topic) => {
        const scores = Object.values(topic.scores || {});
        acc.quizzesTaken += scores.length;
        acc.totalCorrect += scores.reduce((sum, s) => sum + s, 0);
        acc.levelsCleared += topic.highestLevelUnlocked - 1;
        return acc;
    }, { quizzesTaken: 0, totalCorrect: 0, levelsCleared: 0 });

    const accuracy = stats.quizzesTaken > 0 ? ((stats.totalCorrect / (stats.quizzesTaken * QUESTIONS_PER_QUIZ)) * 100).toFixed(0) : 0;
    document.getElementById('stat-quizzes').textContent = stats.quizzesTaken;
    document.getElementById('stat-accuracy').textContent = `${accuracy}%`;
    document.getElementById('stat-levels').textContent = stats.levelsCleared;

    const container = document.getElementById('profile-progress-container');
    container.innerHTML = TOPICS.map(topic => {
        const progress = state.userProgress[topic.id] || { highestLevelUnlocked: 1 };
        const percent = ((progress.highestLevelUnlocked - 1) / TOTAL_LEVELS * 100).toFixed(0);
        return `
            <div class="progress-item">
                <div class="progress-item-header">
                    <div class="progress-topic"><span class="icon">${topic.icon}</span> ${topic.title}</div>
                    <span>${progress.highestLevelUnlocked - 1} / ${TOTAL_LEVELS}</span>
                </div>
                <div class="progress-bar-container" style="margin: 0.5rem 0;">
                    <div class="progress-bar" style="width: ${percent}%;"></div>
                </div>
            </div>`;
    }).join('');
};

// --- QUIZ LOGIC ---
const startTimer = () => {
    const difficulty = getDifficulty(state.currentLevel);
    let timeLeft = getTimerDuration(difficulty);
    const timerEl = document.getElementById('time-left');

    const updateTimerDisplay = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    updateTimerDisplay();
    state.quiz.timerId = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) handleAnswerSubmit();
    }, 1000);
};

const stopTimer = () => clearInterval(state.quiz.timerId);

const resetQuizState = () => {
    stopTimer();
    state.quiz = { questions: [], currentQuestionIndex: 0, selectedAnswer: null, score: 0, answerSubmitted: false, timerId: null };
};

const handleAnswerSubmit = () => {
    if (state.quiz.answerSubmitted) return;
    state.quiz.answerSubmitted = true;
    renderQuizResult();
};

const handleNextQuestion = () => {
    if (state.quiz.currentQuestionIndex < state.quiz.questions.length - 1) {
        state.quiz.currentQuestionIndex++;
        state.quiz.selectedAnswer = null;
        state.quiz.answerSubmitted = false;
        renderQuizQuestion();
        startTimer();
    } else {
        state.lastScore = state.quiz.score;
        saveScore(state.currentTopic.id, state.currentLevel, state.quiz.score);
        if (state.quiz.score >= SCORE_TO_UNLOCK_NEXT_LEVEL) {
            unlockNextLevel(state.currentTopic.id, state.currentLevel);
        }
        navigateTo(Screen.RESULTS);
    }
};

const startQuiz = async () => {
    resetQuizState();
    showLoading('Generating AI Quiz...');
    const questions = await generateQuizQuestions(state.currentTopic.title, state.currentLevel);
    hideLoading();
    if (questions) {
        state.quiz.questions = questions;
        renderQuizQuestion();
        startTimer();
    } else {
        alert("Failed to load quiz questions. Please check your connection and try again.");
        navigateTo(Screen.LEVEL);
    }
};

// --- PROGRESS & STORAGE ---
const saveProgress = () => localStorage.setItem('aiQuizNexusProgress', JSON.stringify(state.userProgress));
const loadProgress = () => {
    const saved = localStorage.getItem('aiQuizNexusProgress');
    if (saved) state.userProgress = JSON.parse(saved);
};

const unlockNextLevel = (topicId, completedLevel) => {
    const progress = state.userProgress[topicId] || { highestLevelUnlocked: 1, scores: {} };
    if (completedLevel === progress.highestLevelUnlocked && completedLevel < TOTAL_LEVELS) {
        progress.highestLevelUnlocked++;
    }
    state.userProgress[topicId] = progress;
    saveProgress();
};

const saveScore = (topicId, level, score) => {
    const progress = state.userProgress[topicId] || { highestLevelUnlocked: 1, scores: {} };
    progress.scores = progress.scores || {};
    progress.scores[level] = Math.max(progress.scores[level] || 0, score);
    state.userProgress[topicId] = progress;
    saveProgress();
};

// --- NAVIGATION & UI CONTROL ---
const showLoading = (text = 'Loading...') => {
    dom.loadingText.textContent = text;
    dom.loadingOverlay.classList.remove('hidden');
};
const hideLoading = () => dom.loadingOverlay.classList.add('hidden');

const navigateTo = (screenId) => {
    state.currentScreen = screenId;
    dom.screens.forEach(s => s.classList.toggle('hidden', s.id !== screenId));
    
    const bgClass = state.currentTopic ? `bg-${state.currentTopic.id}` : 'bg-default';
    dom.appContainer.className = bgClass;

    const showHeader = screenId !== Screen.WELCOME && screenId !== Screen.AUTH;
    dom.appHeader.classList.toggle('hidden', !showHeader);
    dom.appFooter.classList.toggle('hidden', !showHeader);

    updateHeader(screenId);

    switch (screenId) {
        case Screen.HOME: renderHomeScreen(); break;
        case Screen.LEVEL: renderLevelScreen(); break;
        case Screen.QUIZ: startQuiz(); break;
        case Screen.RESULTS: renderResultsScreen(); break;
        case Screen.PROFILE: renderProfileScreen(); break;
        // No default render needed for welcome/auth
    }
};

const updateHeader = (screenId) => {
    let navHTML = '';
    if (screenId === Screen.QUIZ) {
        navHTML = `<button id="quit-quiz-btn" class="btn btn-secondary">Quit</button>`;
    } else if (screenId !== Screen.WELCOME && screenId !== Screen.AUTH) {
        navHTML = `
            <nav>
                <button id="profile-btn" class="btn btn-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <span>Profile</span>
                </button>
                <img src="https://i.pravatar.cc/40?u=aisha" alt="User Avatar" class="avatar" />
            </nav>
        `;
    }
    dom.headerNavContainer.innerHTML = navHTML;
};

// --- EVENT LISTENERS ---
const addEventListeners = () => {
    document.getElementById('start-journey-btn').addEventListener('click', () => navigateTo(Screen.AUTH));
    document.querySelector('.logo').addEventListener('click', () => {
        if (state.currentScreen !== Screen.WELCOME && state.currentScreen !== Screen.AUTH) {
            navigateTo(Screen.HOME);
        }
    });
    document.getElementById('back-to-topics-btn').addEventListener('click', () => navigateTo(Screen.HOME));
    document.getElementById('start-current-level-btn').addEventListener('click', () => {
        const progress = state.userProgress[state.currentTopic.id] || { highestLevelUnlocked: 1 };
        state.currentLevel = progress.highestLevelUnlocked;
        navigateTo(Screen.QUIZ);
    });
    // Dynamic buttons
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        
        if (target.id === 'login-btn' || target.id === 'signup-btn' || target.id === 'guest-btn') {
            navigateTo(Screen.HOME);
        }
        if (target.id === 'submit-answer-btn') handleAnswerSubmit();
        if (target.id === 'next-question-btn') handleNextQuestion();
        if (target.id === 'profile-btn') navigateTo(Screen.PROFILE);
        if (target.id === 'quit-quiz-btn') navigateTo(Screen.LEVEL);
        if (target.id === 'next-level-btn') {
            state.currentLevel++;
            navigateTo(Screen.QUIZ);
        }
        if (target.id === 'retry-btn') navigateTo(Screen.QUIZ);
        if (target.id === 'home-btn') navigateTo(Screen.HOME);
    });
};

// --- BACKGROUND ANIMATIONS ---
const initMatrix = () => {
    const canvas = dom.matrixCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
    const columns = Math.floor(canvas.width / 20);
    const drops = Array(columns).fill(1);
    
    let animationFrameId;
    function draw() {
        ctx.fillStyle = "rgba(10, 15, 31, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#00F6A3"; // Accent green
        ctx.font = "15px monospace";

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * 20, drops[i] * 20);
            if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
        animationFrameId = requestAnimationFrame(draw);
    }
    draw();

    window.addEventListener('resize', () => {
        cancelAnimationFrame(animationFrameId);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        draw();
    });
};


// --- INITIALIZATION ---
const init = () => {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then(reg => console.log('Service Worker registered.'))
                .catch(err => console.log(`Service Worker registration failed: ${err}`));
        });
    }
    loadProgress();
    addEventListeners();
    initMatrix();
    navigateTo(Screen.WELCOME);
};

document.addEventListener('DOMContentLoaded', init);