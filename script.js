// script.js for AI Quiz Nexus - Fully client-side logic
// This file controls the entire quiz application, from navigation to quiz logic and progress tracking.

// --- CONFIGURATION & CONSTANTS ---
const TOTAL_LEVELS = 30;
const QUESTIONS_PER_QUIZ = 10;
const SCORE_TO_UNLOCK_NEXT_LEVEL = 6; // User must score at least 6/10 to unlock the next level

// Enum for screen management, making navigation logic clearer.
const Screen = {
    WELCOME: 'welcome-screen',
    HOME: 'home-screen',
    LEVEL: 'level-screen',
    QUIZ: 'quiz-screen',
    RESULTS: 'results-screen',
};

// Centralized topic data. To add a new topic, add it here and provide questions in questions.js.
const TOPICS = [
    { id: 'programming', title: 'Programming Languages', description: 'Test your knowledge of algorithms, data structures, and languages.', icon: '💻' },
    { id: 'world_knowledge', title: 'World Knowledge', description: 'A test of general knowledge about our diverse world.', icon: '🌍' },
    { id: 'biology', title: 'Biological Knowledge', description: 'Uncover the secrets of life, from DNA to ecosystems.', icon: '🧬' },
    { id: 'space_astronomy', title: 'Space and Astronomy', description: 'Explore the cosmos, from planets to distant galaxies.', icon: '🔭' },
    { id: 'technology_ai', title: 'Technology and AI', description: 'Explore neural networks, machine learning, and automation.', icon: '🧠' },
    { id: 'history_geography', title: 'History and Geography', description: 'Journey through time and across the globe.', icon: '🗺️' },
    { id: 'mathematics_logic', title: 'Mathematics and Logic', description: 'Challenge your mind with logic, calculus, and theorems.', icon: '🧮' },
    { id: 'science_inventions', title: 'Science and Inventions', description: 'Discover the breakthroughs that shaped our world.', icon: '🔬' },
    { id: 'islamic_knowledge', title: 'Islamic Knowledge', description: 'Deepen your understanding of Islamic history and teachings.', icon: '🕌' },
];

// --- DOM ELEMENT CACHE ---
// Caching DOM elements for performance to avoid repeated lookups.
const dom = {
    appContainer: document.getElementById('app-container'),
    screens: document.querySelectorAll('.screen'),
    loadingOverlay: document.getElementById('loading-overlay'),
    loadingText: document.getElementById('loading-text'),
    appHeader: document.getElementById('app-header'),
    appFooter: document.getElementById('app-footer'),
    matrixCanvas: document.getElementById('matrix-canvas'),
};

// --- APPLICATION STATE ---
// A single state object to manage the application's status.
let state = {
    currentScreen: null,
    currentTopic: null,
    currentLevel: 1,
    userProgress: {}, // Persisted in localStorage
    quiz: {
        questions: [],
        currentQuestionIndex: 0,
        selectedAnswer: null,
        score: 0,
        answerSubmitted: false,
    }
};

// --- QUIZ DATA & LOGIC ---

/**
 * Shuffles an array in place.
 * @param {Array} array The array to shuffle.
 * @returns {Array} The shuffled array.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Fetches and prepares quiz questions from the local `questions.js` data source.
 * @param {string} topicTitle - The title of the quiz topic.
 * @param {number} level - The current level.
 * @returns {Array<Object>|null} An array of question objects or null if not found.
 */
const getLocalQuizQuestions = (topicTitle, level) => {
    if (questions[topicTitle] && questions[topicTitle][level]) {
        const levelQuestions = [...questions[topicTitle][level]]; // Create a copy to avoid modifying the original data
        return shuffleArray(levelQuestions).slice(0, QUESTIONS_PER_QUIZ);
    }
    console.error(`No questions found for topic "${topicTitle}" at level ${level}.`);
    return null; // No questions available
};

// --- RENDERING LOGIC ---
// Functions responsible for updating the DOM for each screen.

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
    const progress = state.userProgress[state.currentTopic.title] || { highestLevelUnlocked: 1 };
    const completion = Math.floor(((progress.highestLevelUnlocked - 1) / TOTAL_LEVELS) * 100);

    document.getElementById('level-progress-text').textContent = `Progress: ${completion}% (${progress.highestLevelUnlocked - 1} of ${TOTAL_LEVELS} levels cleared)`;
    document.getElementById('level-progress-bar').style.width = `${completion}%`;

    const levelGrid = document.getElementById('level-grid');
    levelGrid.innerHTML = Array.from({ length: TOTAL_LEVELS }, (_, i) => {
        const level = i + 1;
        const isUnlocked = level <= progress.highestLevelUnlocked;
        const isCompleted = level < progress.highestLevelUnlocked;
        const statusClass = isCompleted ? 'completed' : isUnlocked ? 'unlocked' : 'locked';
        return `
            <button class="level-btn ${statusClass}" data-level="${level}" ${!isUnlocked ? 'disabled' : ''}>
                <div class="level-number">${level}</div>
                <div class="level-status">${isCompleted ? 'Done' : isUnlocked ? 'Open' : 'Locked'}</div>
            </button>
        `;
    }).join('');
    
    levelGrid.querySelectorAll('.unlocked, .completed').forEach(btn => {
        btn.addEventListener('click', () => {
            state.currentLevel = parseInt(btn.dataset.level, 10);
            navigateTo(Screen.QUIZ);
        });
    });
};

const renderQuizQuestion = () => {
    const { questions, currentQuestionIndex } = state.quiz;
    const question = questions[currentQuestionIndex];
    
    document.getElementById('question-counter').textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    document.getElementById('quiz-progress-bar').style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;
    document.getElementById('question-text').textContent = question.q;

    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = ''; // Clear previous options

    // Shuffle options to make it more challenging
    const shuffledOptions = shuffleArray([...question.options]);

    shuffledOptions.forEach((option) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        
        btn.addEventListener('click', () => {
            if (state.quiz.answerSubmitted) return;
            state.quiz.selectedAnswer = option;
            document.querySelectorAll('.option-btn.selected').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
        
        optionsContainer.appendChild(btn);
    });

    document.getElementById('quiz-action-buttons').innerHTML = `<button id="submit-answer-btn" class="btn btn-primary">Submit</button>`;
};

const renderQuizResult = () => {
    const { questions, currentQuestionIndex, selectedAnswer } = state.quiz;
    const question = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === question.answer;
    if (isCorrect) state.quiz.score++;

    document.querySelectorAll('.option-btn').forEach((btn) => {
        btn.disabled = true;
        if (btn.textContent === question.answer) btn.classList.add('correct');
        else if (btn.textContent === selectedAnswer) btn.classList.add('incorrect');
    });

    const nextText = currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz';
    document.getElementById('quiz-action-buttons').innerHTML = `<button id="next-question-btn" class="btn btn-primary">${nextText}</button>`;
};

const renderResultsScreen = () => {
    const score = state.quiz.score;
    document.getElementById('results-topic-text').textContent = `Performance for ${state.currentTopic.title} - Level ${state.currentLevel}`;
    document.getElementById('final-score-value').textContent = String(score);
    document.getElementById('total-questions-value').textContent = String(QUESTIONS_PER_QUIZ);
    document.getElementById('correct-answers').textContent = String(score);
    document.getElementById('incorrect-answers').textContent = String(QUESTIONS_PER_QUIZ - score);

    const unlocked = score >= SCORE_TO_UNLOCK_NEXT_LEVEL;
    const unlockMsg = document.getElementById('unlock-message');
    unlockMsg.classList.toggle('hidden', !unlocked);
    if (unlocked) {
        if (state.currentLevel < TOTAL_LEVELS) {
            unlockMsg.textContent = 'Congratulations! Next Level Unlocked!';
        } else {
            unlockMsg.textContent = 'Mastered! You have cleared all levels in this topic!';
        }
    } else {
         unlockMsg.textContent = `You need ${SCORE_TO_UNLOCK_NEXT_LEVEL} correct answers to unlock the next level.`;
         unlockMsg.classList.remove('hidden');
    }
    
    document.getElementById('results-action-buttons').innerHTML = `
        ${unlocked && state.currentLevel < TOTAL_LEVELS ? '<button id="next-level-btn" class="btn btn-primary">Next Level</button>' : ''}
        <button id="retry-btn" class="btn btn-secondary">Retry Level</button>
        <button id="home-btn" class="btn btn-secondary">Back to Topics</button>
    `;
};

// --- QUIZ WORKFLOW ---

const resetQuizState = () => {
    state.quiz = { questions: [], currentQuestionIndex: 0, selectedAnswer: null, score: 0, answerSubmitted: false };
};

const handleAnswerSubmit = () => {
    if (state.quiz.answerSubmitted || state.quiz.selectedAnswer === null) return;
    state.quiz.answerSubmitted = true;
    renderQuizResult();
};

const handleNextQuestion = () => {
    if (state.quiz.currentQuestionIndex < state.quiz.questions.length - 1) {
        state.quiz.currentQuestionIndex++;
        state.quiz.selectedAnswer = null;
        state.quiz.answerSubmitted = false;
        renderQuizQuestion();
    } else {
        saveScore(state.currentTopic.title, state.currentLevel, state.quiz.score);
        if (state.quiz.score >= SCORE_TO_UNLOCK_NEXT_LEVEL) {
            unlockNextLevel(state.currentTopic.title, state.currentLevel);
        }
        navigateTo(Screen.RESULTS);
    }
};

const startQuiz = () => {
    resetQuizState();
    const questions = getLocalQuizQuestions(state.currentTopic.title, state.currentLevel);
    
    if (questions && questions.length > 0) {
        state.quiz.questions = questions;
        renderQuizQuestion();
    } else {
        alert("Failed to load quiz questions for this level. Please try another level or topic.");
        navigateTo(Screen.LEVEL);
    }
};

// --- PROGRESS & STORAGE ---

const saveProgress = () => localStorage.setItem('aiQuizNexusProgress', JSON.stringify(state.userProgress));
const loadProgress = () => {
    const saved = localStorage.getItem('aiQuizNexusProgress');
    if (saved) state.userProgress = JSON.parse(saved);
};

const unlockNextLevel = (topicTitle, completedLevel) => {
    const progress = state.userProgress[topicTitle] || { highestLevelUnlocked: 1, scores: {} };
    if (completedLevel === progress.highestLevelUnlocked && completedLevel < TOTAL_LEVELS) {
        progress.highestLevelUnlocked++;
    }
    state.userProgress[topicTitle] = progress;
    saveProgress();
};

const saveScore = (topicTitle, level, score) => {
    const progress = state.userProgress[topicTitle] || { highestLevelUnlocked: 1, scores: {} };
    progress.scores = progress.scores || {};
    progress.scores[level] = Math.max(progress.scores[level] || 0, score);
    state.userProgress[topicTitle] = progress;
    saveProgress();
};

// --- NAVIGATION & UI CONTROL ---

const showLoading = (text = 'Loading...') => {
    dom.loadingText.textContent = text;
    dom.loadingOverlay.classList.remove('hidden');
};
const hideLoading = () => dom.loadingOverlay.classList.add('hidden');

/**
 * Main navigation function. Switches between screens and triggers renders.
 * @param {string} screenId - The ID of the screen to show.
 */
const navigateTo = (screenId) => {
    state.currentScreen = screenId;
    dom.screens.forEach(s => s.classList.toggle('hidden', s.id !== screenId));
    
    const bgClass = state.currentTopic ? `bg-${state.currentTopic.id}` : 'bg-default';
    dom.appContainer.className = bgClass;
    
    const showHeaderFooter = screenId !== Screen.WELCOME;
    dom.appHeader.classList.toggle('hidden', !showHeaderFooter);
    dom.appFooter.classList.toggle('hidden', !showHeaderFooter);

    // Trigger render function for the new screen
    switch (screenId) {
        case Screen.HOME: renderHomeScreen(); break;
        case Screen.LEVEL: renderLevelScreen(); break;
        case Screen.QUIZ: startQuiz(); break;
        case Screen.RESULTS: renderResultsScreen(); break;
    }
};

// --- EVENT LISTENERS ---

/**
 * Sets up all initial and delegated event listeners.
 */
const addEventListeners = () => {
    document.getElementById('start-journey-btn').addEventListener('click', () => navigateTo(Screen.HOME));
    document.querySelector('.logo').addEventListener('click', () => {
        if (state.currentScreen !== Screen.WELCOME) {
            navigateTo(Screen.HOME);
        }
    });
    document.getElementById('back-to-topics-btn').addEventListener('click', () => navigateTo(Screen.HOME));
    
    // Delegated event listener for dynamically added buttons
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        
        switch(target.id) {
            case 'submit-answer-btn':
                handleAnswerSubmit();
                break;
            case 'next-question-btn':
                handleNextQuestion();
                break;
            case 'next-level-btn':
                state.currentLevel++;
                navigateTo(Screen.QUIZ);
                break;
            case 'retry-btn':
                navigateTo(Screen.QUIZ);
                break;
            case 'home-btn':
                navigateTo(Screen.HOME);
                break;
        }
    });
};

// --- BACKGROUND ANIMATIONS ---

const initMatrix = () => {
    const canvas = dom.matrixCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const setup = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    setup();

    const chars = "01";
    const columns = Math.floor(canvas.width / 20);
    const drops = Array(columns).fill(1).map(() => Math.floor(Math.random() * canvas.height));
    
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
    }
    const animationInterval = setInterval(draw, 33);

    window.addEventListener('resize', () => {
        setup();
    });
};

// --- INITIALIZATION ---

/**
 * Initializes the application.
 */
const init = () => {
    loadProgress();
    addEventListeners();
    initMatrix();
    navigateTo(Screen.WELCOME);
};

// Start the application once the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', init);
