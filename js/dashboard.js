
document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    
    const TOTAL_LEVELS = 30;
    const QUESTIONS_PER_QUIZ = 10;
    const SCORE_TO_UNLOCK_NEXT_LEVEL = 6;

    const Screen = {
        HOME: 'home-screen',
        LEVEL: 'level-screen',
        QUIZ: 'quiz-screen',
        RESULTS: 'results-screen',
    };

    const TOPICS = [
        { id: 'programming', title: 'Programming', icon: '💻' },
        { id: 'world_knowledge', title: 'World Knowledge', icon: '🌍' },
        { id: 'biology', title: 'Biology', icon: '🧬' },
        { id: 'space_astronomy', title: 'Space', icon: '🔭' },
        { id: 'technology_ai', title: 'Technology & AI', icon: '🧠' },
        { id: 'history_geography', title: 'History', icon: '🗺️' },
        { id: 'mathematics_logic', title: 'Mathematics', icon: '🧮' },
        { id: 'science_inventions', title: 'Science', icon: '🔬' },
        { id: 'islamic_knowledge', title: 'Islamic Knowledge', icon: '🕌' },
    ];

    const dom = {
        screens: document.querySelectorAll('.screen'),
        loadingOverlay: document.getElementById('loading-overlay'),
        loadingText: document.getElementById('loading-text'),
        usernameDisplay: document.getElementById('username-display'),
        guestBanner: document.getElementById('guest-banner'),
        appHeader: document.getElementById('app-header'),
        mainContent: document.querySelector('main'),
    };

    let state = {
        session: window.auth.getSession(),
        isGuest: false,
        currentScreen: Screen.HOME,
        currentTopic: null,
        currentLevel: 1,
        userProgress: {},
        quiz: {},
    };

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    async function getQuizQuestions(topicTitle, level) {
        try {
            const response = await fetch('/api/generate-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: topicTitle,
                    level,
                    questionsPerQuiz: QUESTIONS_PER_QUIZ,
                    totalLevels: TOTAL_LEVELS
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'AI generation failed.');
            }

            const data = await response.json();
            if (!data.questions || data.questions.length === 0) {
                throw new Error("AI returned no questions.");
            }
            return shuffleArray(data.questions);
        } catch (error) {
            console.warn(`AI quiz generation failed for topic "${topicTitle}". Error: ${error.message}. Using fallback questions.`);
            
            const topic = TOPICS.find(t => t.title === topicTitle);
            if (!topic || !window.QUIZ_DATA || !window.QUIZ_DATA[topic.id]) {
                console.error(`No fallback questions available for topic: ${topicTitle}`);
                // Re-throw a more user-friendly error
                throw new Error('Failed to load quiz questions for this topic. Please try again later.');
            }

            const fallbackSet = window.QUIZ_DATA[topic.id];
            const shuffledFallbacks = shuffleArray([...fallbackSet]);
            return shuffledFallbacks.slice(0, QUESTIONS_PER_QUIZ);
        }
    }
    
    // --- PROGRESS & STORAGE ---
    function getStorageKey() {
        if (state.isGuest || !state.session.user.email) {
            return null; // Don't save for guests
        }
        return `aiQuizProgress_${state.session.user.email}`;
    }

    function saveProgress() {
        const key = getStorageKey();
        if (key) {
            localStorage.setItem(key, JSON.stringify(state.userProgress));
        }
    }

    function loadProgress() {
        const key = getStorageKey();
        if (key) {
            const saved = localStorage.getItem(key);
            state.userProgress = saved ? JSON.parse(saved) : {};
        } else {
            state.userProgress = {}; // Reset for guests
        }
    }

    function unlockNextLevel(topicTitle, completedLevel) {
        const progress = state.userProgress[topicTitle] || { highestLevelUnlocked: 1, scores: {} };
        if (completedLevel === progress.highestLevelUnlocked && completedLevel < TOTAL_LEVELS) {
            progress.highestLevelUnlocked++;
        }
        state.userProgress[topicTitle] = progress;
        saveProgress();
    }

    function saveScore(topicTitle, level, score) {
        const progress = state.userProgress[topicTitle] || { highestLevelUnlocked: 1, scores: {} };
        progress.scores = progress.scores || {};
        progress.scores[level] = Math.max(progress.scores[level] || 0, score);
        state.userProgress[topicTitle] = progress;
        saveProgress();
    }

    // --- RENDERING LOGIC ---
    function renderHomeScreen() {
        const topicGrid = document.getElementById('topic-grid');
        topicGrid.innerHTML = TOPICS.map(topic => `
            <div class="topic-card" data-topic-title="${topic.title}">
                <div class="icon">${topic.icon}</div>
                <h3>${topic.title}</h3>
            </div>
        `).join('');

        topicGrid.querySelectorAll('.topic-card').forEach(card => {
            card.addEventListener('click', () => {
                state.currentTopic = TOPICS.find(t => t.title === card.dataset.topicTitle);
                navigateTo(Screen.LEVEL);
            });
        });
    }

    function renderLevelScreen() {
        document.getElementById('level-topic-title').textContent = state.currentTopic.title;
        const progress = state.userProgress[state.currentTopic.title] || { highestLevelUnlocked: 1 };
        const completion = Math.floor(((progress.highestLevelUnlocked - 1) / TOTAL_LEVELS) * 100);
        document.getElementById('level-progress-text').textContent = `Progress: ${completion}%`;
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
        document.getElementById('current-level-text').textContent = progress.highestLevelUnlocked;
    }

    function renderQuizQuestion() {
        const { questions, currentQuestionIndex } = state.quiz;
        const question = questions[currentQuestionIndex];
        
        document.getElementById('question-counter').textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
        document.getElementById('quiz-progress-bar').style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;
        document.getElementById('question-text').textContent = question.q;

        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        const options = shuffleArray([...question.options]);

        options.forEach(option => {
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
    }

    function renderQuizResult() {
        const { questions, currentQuestionIndex, selectedAnswer } = state.quiz;
        const question = questions[currentQuestionIndex];
        const isCorrect = selectedAnswer === question.answer;
        if (isCorrect) state.quiz.score++;

        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === question.answer) btn.classList.add('correct');
            else if (btn.textContent === selectedAnswer) btn.classList.add('incorrect');
        });

        const nextText = currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz';
        document.getElementById('quiz-action-buttons').innerHTML = `<button id="next-question-btn" class="btn btn-primary">${nextText}</button>`;
    }
    
    function renderResultsScreen() {
        const score = state.quiz.score;
        document.getElementById('results-topic-text').textContent = `Performance for ${state.currentTopic.title} - Level ${state.currentLevel}`;
        document.getElementById('final-score-value').textContent = String(score);
        document.getElementById('total-questions-value').textContent = String(QUESTIONS_PER_QUIZ);
        document.getElementById('correct-answers').textContent = String(score);
        document.getElementById('incorrect-answers').textContent = String(QUESTIONS_PER_QUIZ - score);

        const unlocked = score >= SCORE_TO_UNLOCK_NEXT_LEVEL;
        const unlockMsg = document.getElementById('unlock-message');
        
        if (state.isGuest) {
            unlockMsg.textContent = 'Sign up to save progress and unlock new levels!';
        } else if (unlocked) {
            unlockMsg.textContent = state.currentLevel < TOTAL_LEVELS ? 'Congratulations! Next Level Unlocked!' : 'Mastered! All levels cleared!';
        } else {
            unlockMsg.textContent = `You need ${SCORE_TO_UNLOCK_NEXT_LEVEL} correct answers to unlock the next level.`;
        }
        unlockMsg.classList.remove('hidden');
        
        document.getElementById('results-action-buttons').innerHTML = `
            ${unlocked && !state.isGuest && state.currentLevel < TOTAL_LEVELS ? '<button id="next-level-btn" class="btn btn-primary">Next Level</button>' : ''}
            <button id="retry-btn" class="btn btn-secondary">Retry Level</button>
            <button id="topics-btn" class="btn btn-secondary">Back to Topics</button>
        `;
    }

    // --- QUIZ WORKFLOW ---
    function resetQuizState() {
        state.quiz = { questions: [], currentQuestionIndex: 0, selectedAnswer: null, score: 0, answerSubmitted: false };
    }
    
    function handleAnswerSubmit() {
        if (state.quiz.answerSubmitted || state.quiz.selectedAnswer === null) return;
        state.quiz.answerSubmitted = true;
        renderQuizResult();
    }
    
    function handleNextQuestion() {
        if (state.quiz.currentQuestionIndex < state.quiz.questions.length - 1) {
            state.quiz.currentQuestionIndex++;
            state.quiz.selectedAnswer = null;
            state.quiz.answerSubmitted = false;
            renderQuizQuestion();
        } else {
            if (!state.isGuest) {
                saveScore(state.currentTopic.title, state.currentLevel, state.quiz.score);
                if (state.quiz.score >= SCORE_TO_UNLOCK_NEXT_LEVEL) {
                    unlockNextLevel(state.currentTopic.title, state.currentLevel);
                }
            }
            navigateTo(Screen.RESULTS);
        }
    }

    async function startQuiz() {
        resetQuizState();
        dom.loadingText.textContent = 'Generating your quiz with AI...';
        dom.loadingOverlay.classList.remove('hidden');
        try {
            const questions = await getQuizQuestions(state.currentTopic.title, state.currentLevel);
            if (!questions || questions.length === 0) throw new Error("Could not load questions.");
            state.quiz.questions = questions;
            renderQuizQuestion();
        } catch (error) {
            console.error(error);
            alert(`Failed to start quiz: ${error.message} Please try again.`);
            navigateTo(Screen.LEVEL);
        } finally {
            dom.loadingOverlay.classList.add('hidden');
            dom.loadingText.textContent = 'Loading...';
        }
    }

    // --- NAVIGATION ---
    function navigateTo(screenId) {
        state.currentScreen = screenId;
        dom.screens.forEach(s => s.classList.toggle('hidden', s.id !== screenId));
        
        switch (screenId) {
            case Screen.HOME: renderHomeScreen(); break;
            case Screen.LEVEL: renderLevelScreen(); break;
            case Screen.QUIZ: startQuiz(); break;
            case Screen.RESULTS: renderResultsScreen(); break;
        }
    }

    // --- INITIALIZATION ---
    function init() {
        const themeToggleButton = document.getElementById('theme-toggle-btn');
        const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
        const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

        function applyInitialTheme() {
            if (!themeToggleButton) return;
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'light') {
                document.body.classList.add('light-mode');
                themeToggleButton.innerHTML = moonIcon;
            } else {
                document.body.classList.remove('light-mode');
                themeToggleButton.innerHTML = sunIcon;
            }
        }

        function toggleTheme() {
            if (document.body.classList.contains('light-mode')) {
                document.body.classList.remove('light-mode');
                themeToggleButton.innerHTML = sunIcon;
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.add('light-mode');
                themeToggleButton.innerHTML = moonIcon;
                localStorage.setItem('theme', 'light');
            }
        }

        if (themeToggleButton) {
            themeToggleButton.addEventListener('click', toggleTheme);
        }
        applyInitialTheme();
        
        if (!state.session) return; // Should have been redirected by auth.js

        if (state.session.user === 'guest') {
            state.isGuest = true;
            dom.guestBanner.classList.remove('hidden');
            dom.usernameDisplay.textContent = 'Guest';
            dom.appHeader.style.top = '48px';
            dom.mainContent.style.paddingTop = '168px';
        } else {
            state.isGuest = false;
            dom.guestBanner.classList.add('hidden');
            dom.usernameDisplay.textContent = state.session.user.username;
        }
        
        loadProgress();
        
        document.getElementById('logout-btn').addEventListener('click', window.auth.logout);
        
        document.addEventListener('click', e => {
            const target = e.target.closest('button');
            if (!target) return;
            switch(target.id) {
                case 'submit-answer-btn': handleAnswerSubmit(); break;
                case 'next-question-btn': handleNextQuestion(); break;
                case 'next-level-btn':
                    state.currentLevel++;
                    navigateTo(Screen.QUIZ);
                    break;
                case 'retry-btn': navigateTo(Screen.QUIZ); break;
                case 'topics-btn': navigateTo(Screen.HOME); break;
                case 'back-to-topics-btn': navigateTo(Screen.HOME); break;
                case 'start-current-level-btn':
                    const progress = state.userProgress[state.currentTopic.title] || { highestLevelUnlocked: 1 };
                    state.currentLevel = progress.highestLevelUnlocked;
                    navigateTo(Screen.QUIZ);
                    break;
            }
        });

        document.querySelector('.logo').addEventListener('click', () => navigateTo(Screen.HOME));

        navigateTo(Screen.HOME);
    }

    init();
});
