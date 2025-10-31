// main.js for AI Quiz Nexus
// --- CONFIGURATION & CONSTANTS ---

const TOTAL_LEVELS = 30;
const QUESTIONS_PER_QUIZ = 10;
const SCORE_TO_UNLOCK_NEXT_LEVEL = 6;

// Enum for screen management
const Screen = {
    WELCOME: 'welcome-screen',
    AUTH: 'auth-screen',
    HOME: 'home-screen',
    LEVEL: 'level-screen',
    QUIZ: 'quiz-screen',
    RESULTS: 'results-screen',
    PROFILE: 'profile-screen',
};

// Unified topic list
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
    userProgress: {}, // Persisted in localStorage
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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


// --- QUIZ CONTENT SERVICE ---

const generateQuizQuestions = async (topicTitle, level) => {
    // Always use local questions as API has been removed.
    return getLocalQuizQuestions(topicTitle, level);
};

const generateAiFeedback = async (topicTitle, score) => {
    // Static feedback is provided since API is removed.
    if (score >= 8) {
        return `Excellent work on the ${topicTitle} quiz! A score of ${score}/${QUESTIONS_PER_QUIZ} is impressive. You have a strong grasp of the subject!`;
    } else if (score >= SCORE_TO_UNLOCK_NEXT_LEVEL) {
        return `Good job! You scored ${score}/${QUESTIONS_PER_QUIZ} on the ${topicTitle} quiz and unlocked the next level. Keep pushing forward!`;
    } else {
        return `You scored ${score}/${QUESTIONS_PER_QUIZ}. A good attempt! Review the questions and try again to master this ${topicTitle} topic.`;
    }
};

// --- LOCAL DATA ---
const getLocalQuizQuestions = (topicTitle, level) => {
    console.log(`Using local questions for ${topicTitle} - Level ${level}.`);
    if (localQuestions[topicTitle] && localQuestions[topicTitle][level]) {
        const levelQuestions = [...localQuestions[topicTitle][level]];
        const shuffled = shuffleArray(levelQuestions).slice(0, QUESTIONS_PER_QUIZ);

        // Convert question format to match the one expected by the renderer
        return shuffled.map(q => {
            const options = shuffleArray([...q.options]);
            const correctIndex = options.findIndex(opt => opt === q.answer);
            return {
                question: q.q,
                options: options,
                correctAnswerIndex: correctIndex,
            };
        });
    }
    console.error(`No local questions found for topic "${topicTitle}" at level ${level}.`);
    return null;
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
    const progress = state.userProgress[state.currentTopic.title] || { highestLevelUnlocked: 1 };
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
        btn.dataset.index = String(index);
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

const animateCounter = (element, targetValue, duration = 1000) => {
    if (targetValue === 0) {
        element.textContent = 0;
        return;
    }
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.textContent = String(Math.floor(progress * targetValue));
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
};

const renderResultsScreen = () => {
    document.getElementById('results-topic-text').textContent = `Performance for ${state.currentTopic.title} - Level ${state.currentLevel}`;
    
    const finalScoreEl = document.getElementById('final-score-value');
    animateCounter(finalScoreEl, state.lastScore, 1000);

    document.getElementById('total-questions-value').textContent = String(QUESTIONS_PER_QUIZ);
    document.getElementById('correct-answers').textContent = String(state.lastScore);
    document.getElementById('incorrect-answers').textContent = String(QUESTIONS_PER_QUIZ - state.lastScore);

    const unlocked = state.lastScore >= SCORE_TO_UNLOCK_NEXT_LEVEL;
    const unlockMsg = document.getElementById('unlock-message');
    unlockMsg.classList.toggle('hidden', !unlocked);
    if(unlocked) {
        unlockMsg.textContent = state.currentLevel < TOTAL_LEVELS ? 'Level Unlocked!' : 'All Levels Cleared!';
        triggerConfetti();
    }
    
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
    document.getElementById('stat-quizzes').textContent = String(stats.quizzesTaken);
    document.getElementById('stat-accuracy').textContent = `${accuracy}%`;
    document.getElementById('stat-levels').textContent = String(stats.levelsCleared);

    const container = document.getElementById('profile-progress-container');
    container.innerHTML = TOPICS.map(topic => {
        const progress = state.userProgress[topic.title] || { highestLevelUnlocked: 1 };
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
    stopTimer();
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
        if (timeLeft <= 0) {
            handleAnswerSubmit();
        }
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
        const quizBody = document.querySelector('#quiz-screen .quiz-body');
        quizBody.style.animation = 'question-fade-out 0.25s ease-in forwards';

        setTimeout(() => {
            state.quiz.currentQuestionIndex++;
            state.quiz.selectedAnswer = null;
            state.quiz.answerSubmitted = false;
            renderQuizQuestion();
            startTimer();
            quizBody.style.animation = 'question-fade-in 0.25s ease-out forwards';
        }, 250);
    } else {
        state.lastScore = state.quiz.score;
        saveScore(state.currentTopic.title, state.currentLevel, state.quiz.score);
        if (state.quiz.score >= SCORE_TO_UNLOCK_NEXT_LEVEL) {
            unlockNextLevel(state.currentTopic.title, state.currentLevel);
        }
        navigateTo(Screen.RESULTS);
    }
};

const startQuiz = async () => {
    resetQuizState();
    showLoading('Preparing Quiz...');
    const questions = await generateQuizQuestions(state.currentTopic.title, state.currentLevel);
    hideLoading();
    if (questions && questions.length > 0) {
        state.quiz.questions = questions;
        renderQuizQuestion();
        startTimer();
    } else {
        alert("Failed to load quiz questions. Please try again.");
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

// --- THEME MANAGEMENT ---

const applyTheme = (theme) => {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    const toggle = document.getElementById('theme-toggle-checkbox');
    if (toggle) {
        toggle.checked = theme === 'dark';
    }
};

const loadAndApplyTheme = () => {
    const savedTheme = localStorage.getItem('aiQuizNexusTheme') || 'light'; // Default to light theme
    applyTheme(savedTheme);
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
    }
};

const updateHeader = (screenId) => {
    let navHTML = '';
    if (screenId === Screen.QUIZ) {
        navHTML = `<button id="quit-quiz-btn" class="btn btn-secondary">Quit</button>`;
    } else if (screenId !== Screen.WELCOME && screenId !== Screen.AUTH) {
        navHTML = `
            <nav>
                <div class="theme-switch-wrapper">
                    <label class="theme-switch" for="theme-toggle-checkbox" title="Toggle theme">
                        <input type="checkbox" id="theme-toggle-checkbox" />
                        <span class="slider round"></span>
                    </label>
                </div>
                <button id="profile-btn" class="btn btn-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <span>Profile</span>
                </button>
                <img src="https://i.pravatar.cc/40?u=aisha" alt="User Avatar" class="avatar" />
            </nav>
        `;
    }
    dom.headerNavContainer.innerHTML = navHTML;

    // Ensure the toggle reflects the current theme after it's been rendered
    const savedTheme = localStorage.getItem('aiQuizNexusTheme') || 'light';
    const toggle = document.getElementById('theme-toggle-checkbox');
    if (toggle) {
        toggle.checked = savedTheme === 'dark';
    }
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
    
    // Delegated listener for theme toggle
    document.addEventListener('change', (e) => {
        if (e.target.id === 'theme-toggle-checkbox') {
            const newTheme = e.target.checked ? 'dark' : 'light';
            localStorage.setItem('aiQuizNexusTheme', newTheme);
            applyTheme(newTheme);
        }
    });

    document.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        
        switch(target.id) {
            case 'login-btn':
            case 'signup-btn':
            case 'guest-btn':
                navigateTo(Screen.HOME);
                break;
            case 'start-current-level-btn':
                {
                    const progress = state.userProgress[state.currentTopic.title] || { highestLevelUnlocked: 1 };
                    state.currentLevel = progress.highestLevelUnlocked;
                    navigateTo(Screen.QUIZ);
                    break;
                }
            case 'submit-answer-btn':
                handleAnswerSubmit();
                break;
            case 'next-question-btn':
                handleNextQuestion();
                break;
            case 'profile-btn':
                navigateTo(Screen.PROFILE);
                break;
            case 'quit-quiz-btn':
                if (confirm('Are you sure you want to quit? Your progress in this quiz will be lost.')) {
                    navigateTo(Screen.LEVEL);
                }
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
    let animationFrameId;

    const setup = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    
    setup();

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
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
        animationFrameId = requestAnimationFrame(draw);
    }
    draw();

    window.addEventListener('resize', () => {
        cancelAnimationFrame(animationFrameId);
        setup();
        draw();
    });
};

// --- CONFETTI ANIMATION ---
const triggerConfetti = () => {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let confettiPieces = [];
    const numberOfPieces = 150;
    const isDarkMode = document.body.classList.contains('dark-theme');
    const colors = isDarkMode 
        ? ['#00eaff', '#9B51E0', '#00F6A3', '#FFBD3E']
        : ['#007bff', '#28a745', '#ffc107', '#6c757d', '#17a2b8'];

    function ConfettiParticle() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.size = Math.random() * 8 + 4;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 + 2;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
    }

    ConfettiParticle.prototype.update = function() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
    };

    ConfettiParticle.prototype.draw = function() {
        ctx.save();
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    };

    const createParticles = () => {
        confettiPieces = [];
        for (let i = 0; i < numberOfPieces; i++) {
            confettiPieces.push(new ConfettiParticle());
        }
    }

    let animationFrameId;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confettiPieces = confettiPieces.filter(p => p.y < canvas.height + 20);
        
        confettiPieces.forEach(p => {
            p.update();
            p.draw();
        });

        if (confettiPieces.length > 0) {
           animationFrameId = requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    createParticles();
    animate();
}


// --- INITIALIZATION ---
const init = () => {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then(reg => console.log('Service Worker registered.'))
                .catch(err => console.log(`Service Worker registration failed: ${err}`));
        });
    }

    loadAndApplyTheme();
    loadProgress();
    addEventListeners();
    initMatrix();
    navigateTo(Screen.WELCOME);
};

document.addEventListener('DOMContentLoaded', init);


// --- LOCAL QUESTIONS DATA ---
const localQuestions = {};

function createPlaceholderLevels(topic, baseLevelData) {
    if (!localQuestions[topic]) localQuestions[topic] = {};
    localQuestions[topic][1] = baseLevelData;
    for (let i = 2; i <= 30; i++) {
        localQuestions[topic][i] = baseLevelData.map(q => ({
            ...q,
            q: `(L${i}) ${q.q}`
        }));
    }
}

// --- 1. Programming Languages ---
createPlaceholderLevels("Programming Languages", [
    { q: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyperlink and Text Markup Language", "Home Tool Markup Language"], answer: "Hyper Text Markup Language" },
    { q: "Which language is primarily used for styling web pages?", options: ["HTML", "JQuery", "CSS", "Python"], answer: "CSS" },
    { q: "What is the correct syntax for a single-line comment in JavaScript?", options: ["// This is a comment", "<!-- This is a comment -->", "# This is a comment", "/* This is a comment */"], answer: "// This is a comment" },
    { q: "Which company developed JavaScript?", options: ["Microsoft", "Apple", "Netscape", "Google"], answer: "Netscape" },
    { q: "What keyword is used to declare a variable in JavaScript that cannot be reassigned?", options: ["const", "var", "let", "static"], answer: "const" },
    { q: "In Python, how do you print 'Hello, World!' to the console?", options: ["console.log('Hello, World!')", "echo 'Hello, World!'", "System.out.println('Hello, World!')", "print('Hello, World!')"], answer: "print('Hello, World!')" },
    { q: "Which of the following is a dynamically typed language?", options: ["C++", "Java", "Python", "C#"], answer: "Python" },
    { q: "What does SQL stand for?", options: ["Stylish Question Language", "Structured Query Language", "Statement Query Language", "Simple Question Language"], answer: "Structured Query Language" },
    { q: "Which tag is used to define an ordered list in HTML?", options: ["<li>", "<ol>", "<ul>", "<list>"], answer: "<ol>" },
    { q: "What is the file extension for a Python file?", options: [".py", ".pt", ".python", ".px"], answer: ".py" }
]);

// --- 2. World Knowledge ---
createPlaceholderLevels("World Knowledge", [
    { q: "What is the capital of Japan?", options: ["Beijing", "Seoul", "Tokyo", "Bangkok"], answer: "Tokyo" },
    { q: "Which is the largest planet in our solar system?", options: ["Earth", "Mars", "Jupiter", "Saturn"], answer: "Jupiter" },
    { q: "What is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], answer: "Nile" },
    { q: "Who painted the Mona Lisa?", options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"], answer: "Leonardo da Vinci" },
    { q: "How many continents are there?", options: ["5", "6", "7", "8"], answer: "7" },
    { q: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: "Pacific" },
    { q: "In which country are the pyramids of Giza located?", options: ["Mexico", "Egypt", "Peru", "Sudan"], answer: "Egypt" },
    { q: "What is the main currency of the United Kingdom?", options: ["Euro", "Dollar", "Pound Sterling", "Yen"], answer: "Pound Sterling" },
    { q: "Which is the tallest mountain in the world?", options: ["K2", "Kangchenjunga", "Mount Everest", "Lhotse"], answer: "Mount Everest" },
    { q: "What is the national animal of Australia?", options: ["Koala", "Kangaroo", "Wombat", "Emu"], answer: "Kangaroo" }
]);

// --- 3. Biological Knowledge ---
createPlaceholderLevels("Biological Knowledge", [
    { q: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondrion", "Golgi apparatus"], answer: "Mitochondrion" },
    { q: "What process do plants use to make their own food?", options: ["Respiration", "Transpiration", "Photosynthesis", "Pollination"], answer: "Photosynthesis" },
    { q: "What does DNA stand for?", options: ["Deoxyribonucleic Acid", "Dirobonucleic Acid", "Denatured Ribonucleic Acid", "Duonucleic Acid"], answer: "Deoxyribonucleic Acid" },
    { q: "Which part of the blood is responsible for clotting?", options: ["Red Blood Cells", "White Blood Cells", "Plasma", "Platelets"], answer: "Platelets" },
    { q: "Humans are examples of which type of animal?", options: ["Reptiles", "Amphibians", "Mammals", "Birds"], answer: "Mammals" },
    { q: "What is the largest organ in the human body?", options: ["Liver", "Brain", "Heart", "Skin"], answer: "Skin" },
    { q: "Which gas do plants absorb from the atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], answer: "Carbon Dioxide" },
    { q: "What is the study of fungi called?", options: ["Botany", "Zoology", "Mycology", "Virology"], answer: "Mycology" },
    { q: "How many bones are in the adult human body?", options: ["206", "212", "198", "220"], answer: "206" },
    { q: "What are the building blocks of proteins?", options: ["Carbohydrates", "Lipids", "Amino Acids", "Nucleotides"], answer: "Amino Acids" }
]);

// --- 4. Space and Astronomy ---
createPlaceholderLevels("Space and Astronomy", [
    { q: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Mercury"], answer: "Mars" },
    { q: "What is the name of the galaxy we live in?", options: ["Andromeda", "Triangulum", "Whirlpool", "Milky Way"], answer: "Milky Way" },
    { q: "What is a light-year a unit of?", options: ["Time", "Distance", "Brightness", "Mass"], answer: "Distance" },
    { q: "Who was the first human to walk on the Moon?", options: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "Michael Collins"], answer: "Neil Armstrong" },
    { q: "What is the center of our Solar System?", options: ["The Earth", "The Sun", "Jupiter", "A Black Hole"], answer: "The Sun" },
    { q: "Which planet is famous for its prominent rings?", options: ["Uranus", "Neptune", "Jupiter", "Saturn"], answer: "Saturn" },
    { q: "What is the name of the force that holds planets in orbit?", options: ["Electromagnetism", "Gravity", "Friction", "The Strong Force"], answer: "Gravity" },
    { q: "What is a large group of stars, dust, and gas bound together by gravity called?", options: ["A Solar System", "A Constellation", "A Galaxy", "A Nebula"], answer: "A Galaxy" },
    { q: "Which is the smallest planet in our solar system?", options: ["Mercury", "Pluto", "Mars", "Venus"], answer: "Mercury" },
    { q: "What is a shooting star?", options: ["A dying star", "A comet", "A meteoroid burning in the atmosphere", "An asteroid"], answer: "A meteoroid burning in the atmosphere" }
]);

// --- 5. Technology and AI ---
createPlaceholderLevels("Technology and AI", [
    { q: "What does 'AI' stand for?", options: ["Automated Intelligence", "Artificial Intelligence", "Algorithmic Interface", "Advanced Intellect"], answer: "Artificial Intelligence" },
    { q: "Who is considered the 'father of Artificial Intelligence'?", options: ["Alan Turing", "John McCarthy", "Geoffrey Hinton", "Tim Berners-Lee"], answer: "John McCarthy" },
    { q: "What is a 'neural network' in AI inspired by?", options: ["Computer circuits", "The human brain", "Social networks", "Ant colonies"], answer: "The human brain" },
    { q: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Processor Unit", "Control Processing Unit"], answer: "Central Processing Unit" },
    { q: "What is 'Machine Learning'?", options: ["A type of computer hardware", "A field of AI that gives computers the ability to learn without being explicitly programmed", "A new programming language", "A theory that machines can think"], answer: "A field of AI that gives computers the ability to learn without being explicitly programmed" },
    { q: "Which company developed the Python programming language?", options: ["Google", "Microsoft", "It was an open-source project led by Guido van Rossum", "Facebook"], answer: "It was an open-source project led by Guido van Rossum" },
    { q: "What does 'IoT' stand for?", options: ["Internet of Technology", "Interface of Things", "Internet of Things", "Internal Object Tracker"], answer: "Internet of Things" },
    { q: "What is the primary function of a router in a network?", options: ["To store data", "To display web pages", "To connect to the internet", "To direct traffic between devices and networks"], answer: "To direct traffic between devices and networks" },
    { q: "What is 'cloud computing'?", options: ["Storing data on your personal computer", "Using a network of remote servers hosted on the Internet to store, manage, and process data", "A type of weather forecasting technology", "A new type of laptop"], answer: "Using a network of remote servers hosted on the Internet to store, manage, and process data" },
    { q: "What does the term 'Big Data' refer to?", options: ["Large hard drives", "Extremely large and complex data sets that cannot be easily managed with traditional data-processing software", "A popular database company", "A type of computer virus"], answer: "Extremely large and complex data sets that cannot be easily managed with traditional data-processing software" }
]);

// --- 6. History and Geography ---
createPlaceholderLevels("History and Geography", [
    { q: "The Great Wall of China was primarily built to protect against invasions from which group?", options: ["The Romans", "The Mongols", "The Japanese", "The Vikings"], answer: "The Mongols" },
    { q: "In which country would you find the ancient city of Machu Picchu?", options: ["Brazil", "Mexico", "Peru", "Colombia"], answer: "Peru" },
    { q: "World War I took place between which years?", options: ["1905-1910", "1914-1918", "1929-1935", "1939-1945"], answer: "1914-1918" },
    { q: "The Amazon River flows through which continent?", options: ["Africa", "Asia", "North America", "South America"], answer: "South America" },
    { q: "Who was the first President of the United States?", options: ["Thomas Jefferson", "Abraham Lincoln", "George Washington", "John Adams"], answer: "George Washington" },
    { q: "The Sahara Desert is located on which continent?", options: ["Australia", "Asia", "Africa", "South America"], answer: "Africa" },
    { q: "The Renaissance, a period of great cultural change and artistic activity, began in which country?", options: ["France", "Spain", "Greece", "Italy"], answer: "Italy" },
    { q: "Which country is known as the 'Land of the Rising Sun'?", options: ["China", "South Korea", "Japan", "Thailand"], answer: "Japan" },
    { q: "The ancient Roman civilization was centered in what present-day country?", options: ["Greece", "Egypt", "Turkey", "Italy"], answer: "Italy" },
    { q: "What is the capital of Canada?", options: ["Toronto", "Vancouver", "Montreal", "Ottawa"], answer: "Ottawa" }
]);

// --- 7. Mathematics and Logic ---
createPlaceholderLevels("Mathematics and Logic", [
    { q: "What is the value of Pi to two decimal places?", options: ["3.12", "3.14", "3.16", "3.18"], answer: "3.14" },
    { q: "What is 12 multiplied by 12?", options: ["144", "124", "169", "132"], answer: "144" },
    { q: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], answer: "6" },
    { q: "What is the square root of 81?", options: ["7", "8", "9", "10"], answer: "9" },
    { q: "In a right-angled triangle, what is the side opposite the right angle called?", options: ["Adjacent", "Opposite", "Hypotenuse", "Base"], answer: "Hypotenuse" },
    { q: "If a train travels at 60 mph, how long does it take to travel 120 miles?", options: ["1 hour", "2 hours", "3 hours", "30 minutes"], answer: "2 hours" },
    { q: "What comes next in the sequence: 2, 4, 8, 16, ...?", options: ["20", "24", "32", "64"], answer: "32" },
    { q: "What is 5! (5 factorial)?", options: ["25", "60", "120", "720"], answer: "120" },
    { q: "How many degrees are in a circle?", options: ["180", "270", "360", "450"], answer: "360" },
    { q: "Which of the following numbers is a prime number?", options: ["9", "15", "21", "23"], answer: "23" }
]);

// --- 8. Science and Inventions ---
createPlaceholderLevels("Science and Inventions", [
    { q: "Who is credited with inventing the telephone?", options: ["Thomas Edison", "Nikola Tesla", "Alexander Graham Bell", "Guglielmo Marconi"], answer: "Alexander Graham Bell" },
    { q: "What is the chemical symbol for water?", options: ["H2O", "CO2", "O2", "NaCl"], answer: "H2O" },
    { q: "Who developed the theory of relativity?", options: ["Isaac Newton", "Galileo Galilei", "Albert Einstein", "Stephen Hawking"], answer: "Albert Einstein" },
    { q: "What does a Geiger counter measure?", options: ["Temperature", "Air pressure", "Radiation", "Light intensity"], answer: "Radiation" },
    { q: "Who invented the World Wide Web?", options: ["Bill Gates", "Steve Jobs", "Tim Berners-Lee", "Vint Cerf"], answer: "Tim Berners-Lee" },
    { q: "What is the freezing point of water in Celsius?", options: ["32°C", "0°C", "100°C", "-10°C"], answer: "0°C" },
    { q: "Which of these is a renewable energy source?", options: ["Natural Gas", "Coal", "Solar Power", "Oil"], answer: "Solar Power" },
    { q: "What is the hardest natural substance on Earth?", options: ["Gold", "Iron", "Quartz", "Diamond"], answer: "Diamond" },
    { q: "Who discovered penicillin?", options: ["Marie Curie", "Louis Pasteur", "Alexander Fleming", "Robert Koch"], answer: "Alexander Fleming" },
    { q: "What force opposes motion between two surfaces in contact?", options: ["Gravity", "Friction", "Magnetism", "Tension"], answer: "Friction" }
]);

// --- 9. Islamic Knowledge ---
createPlaceholderLevels("Islamic Knowledge", [
    { q: "How many pillars of Islam are there?", options: ["3", "4", "5", "6"], answer: "5" },
    { q: "What is the holy book of Islam?", options: ["Torah", "Bible", "Quran", "Zabur"], answer: "Quran" },
    { q: "In which city was Prophet Muhammad (PBUH) born?", options: ["Madinah", "Jerusalem", "Makkah", "Taif"], answer: "Makkah" },
    { q: "What is the name of the Islamic month of fasting?", options: ["Shawwal", "Ramadan", "Rajab", "Dhul Hijjah"], answer: "Ramadan" },
    { q: "Which direction do Muslims face during prayer?", options: ["Towards Jerusalem", "Towards the Kaaba in Makkah", "East", "West"], answer: "Towards the Kaaba in Makkah" },
    { q: "What is the annual charity payment in Islam called?", options: ["Hajj", "Sawm", "Salah", "Zakat"], answer: "Zakat" },
    { q: "Who was the first Caliph after Prophet Muhammad (PBUH)?", options: ["Umar ibn al-Khattab", "Ali ibn Abi Talib", "Uthman ibn Affan", "Abu Bakr al-Siddiq"], answer: "Abu Bakr al-Siddiq" },
    { q: "How many times a day are Muslims required to pray?", options: ["3", "4", "5", "6"], answer: "5" },
    { q: "What is the pilgrimage to Makkah called?", options: ["Umrah", "Ziyarah", "Hajj", "Tawaf"], answer: "Hajj" },
    { q: "Which angel is believed to have delivered the revelations to Prophet Muhammad (PBUH)?", options: ["Mika'il (Michael)", "Israfil (Raphael)", "Jibril (Gabriel)", "Azra'il (Azrael)"], answer: "Jibril (Gabriel)" }
]);