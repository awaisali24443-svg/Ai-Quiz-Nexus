
import sceneManager from './3d/sceneManager.js';

// This function is exported so the dynamically loaded module can use it.
export function getFallbackQuestions(topicTitle, level) {
    const topic = TOPICS.find(t => t.title === topicTitle);
    if (!topic || !window.QUIZ_DATA || !window.QUIZ_DATA[topic.id]) {
        console.error(`No fallback questions available for topic: ${topicTitle}`);
        throw new Error('Failed to load quiz questions for this topic. Please try again later.');
    }

    const topicData = window.QUIZ_DATA[topic.id];
    let fallbackLevelKey;

    if (level <= 10) fallbackLevelKey = 'level_1';
    else if (level <= 20) fallbackLevelKey = 'level_11';
    else fallbackLevelKey = 'level_21';
    
    if (topicData[`level_${level}`]) fallbackLevelKey = `level_${level}`;

    let fallbackSet = topicData[fallbackLevelKey];
    if (!fallbackSet || fallbackSet.length === 0) {
        fallbackSet = topicData['level_1'] || [];
    }
    if (fallbackSet.length === 0) throw new Error('No fallback questions found.');

    const shuffled = [...fallbackSet].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, QUESTIONS_PER_QUIZ);
}


document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    
    const TOTAL_LEVELS = 30;
    const QUESTIONS_PER_QUIZ = 10;
    const SCORE_TO_UNLOCK_NEXT_LEVEL = 7;

    const Screen = {
        HOME: 'home-screen',
        LEVEL: 'level-screen',
        QUIZ: 'quiz-screen',
        RESULTS: 'results-screen',
    };

    const TOPICS = [
        { id: 'programming', title: 'Programming', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>` },
        { id: 'world_knowledge', title: 'World Knowledge', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>` },
        { id: 'biology', title: 'Biology', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 10.5c-3.3 0-3.3 4 0 4h15c3.3 0 3.3-4 0-4h-4.5c-3.3 0-3.3 4 0 4h4.5c3.3 0 3.3-4 0-4H4.5z"></path><path d="M4.5 6.5c-3.3 0-3.3 4 0 4h15c3.3 0 3.3-4 0-4h-4.5c-3.3 0-3.3 4 0 4h4.5c3.3 0 3.3-4 0-4H4.5z"></path></svg>` },
        { id: 'space_astronomy', title: 'Space', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10c0-4.42-2.87-8.17-7-9.58"></path><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.9 0 1.77-.12 2.6-.35"></path></svg>` },
        { id: 'technology_ai', title: 'Technology & AI', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"></path><rect x="4" y="12" width="16" height="8" rx="2"></rect><path d="M12 12v8"></path><path d="M9 12v8"></path><path d="M15 12v8"></path><path d="M9 4h6a2 2 0 0 1 2 2v2"></path><path d="M9 8h6"></path></svg>` },
        { id: 'history_geography', title: 'History', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>` },
        { id: 'mathematics_logic', title: 'Mathematics', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="8" y1="12" x2="16" y2="12"></line><line x1="12" y1="8" x2="12" y2="16"></line><line x1="12" y1="3" x2="12" y2="21"></line><line x1="3" y1="12" x2="21" y2="12"></line></svg>` },
        { id: 'science_inventions', title: 'Science', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg>` },
        { id: 'islamic_knowledge', title: 'Islamic Knowledge', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 14.5A2.5 2.5 0 0 1 4.5 12H8a2.5 2.5 0 0 1 0 5H4.5A2.5 2.5 0 0 1 2 14.5zM22 12h-2.5a2.5 2.5 0 0 0 0 5H22"></path><path d="M12 2a10 10 0 0 0-3.5 19.34"></path><path d="M12 2a10 10 0 0 1 3.5 19.34"></path></svg>` },
    ];
    
    const dom = {
        screens: document.querySelectorAll('.screen'),
        appContainer: document.getElementById('app-container'),
        webglContainer: document.getElementById('webgl-container'),
        loadingOverlay: document.getElementById('loading-overlay'),
        loadingText: document.getElementById('loading-text'),
        usernameDisplay: document.getElementById('username-display'),
        guestBanner: document.getElementById('guest-banner'),
        appHeader: document.getElementById('app-header'),
        mainContent: document.querySelector('main'),
        toggle3DBtn: document.getElementById('toggle-3d-btn'),
        // Quiz Screen specific DOM elements needed by the controller
        quizScreen: document.getElementById('quiz-screen'),
        quizTimer: document.getElementById('quiz-timer'),
        questionCounter: document.getElementById('question-counter'),
        quizHintBtn: document.getElementById('hint-btn'),
        quizHintsLeft: document.getElementById('hints-left'),
        quizProgressBar: document.getElementById('quiz-progress-bar'),
        questionText: document.getElementById('question-text'),
        optionsContainer: document.getElementById('options-container'),
    };

    let state = {
        session: window.auth.getSession(),
        isGuest: false,
        is3DMode: true,
        currentScreen: Screen.HOME,
        currentTopic: null,
        currentLevel: 1,
        userProgress: { totalHints: 30, topics: {} },
        gameMode: 'topic',
    };

    let audioCtx;
    let prefetchPromise = null;
    let quizControllerModule = null;

    // --- UTILITIES (can be passed to modules) ---
    function showToast(message, isError = false) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast ${isError ? 'error' : ''}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 4000);
    }
    
    function showLoading(show, text = 'Loading...') {
        dom.loadingText.textContent = text;
        dom.loadingOverlay.classList.toggle('hidden', !show);
    }

    function playSound(type) {
        if (!audioCtx) return;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        g.gain.setValueAtTime(0, audioCtx.currentTime);
        g.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
        switch (type) {
            case 'click': o.type = 'triangle'; o.frequency.setValueAtTime(440, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(1e-5, audioCtx.currentTime + 0.1); break;
            case 'correct': o.type = 'sine'; o.frequency.setValueAtTime(523.25, audioCtx.currentTime); o.frequency.linearRampToValueAtTime(698.46, audioCtx.currentTime + 0.1); g.gain.exponentialRampToValueAtTime(1e-5, audioCtx.currentTime + 0.2); break;
            case 'incorrect': o.type = 'square'; o.frequency.setValueAtTime(220, audioCtx.currentTime); o.frequency.linearRampToValueAtTime(164.81, audioCtx.currentTime + 0.1); g.gain.exponentialRampToValueAtTime(1e-5, audioCtx.currentTime + 0.2); break;
            case 'levelUp': o.type = 'triangle'; o.frequency.setValueAtTime(440, audioCtx.currentTime); o.frequency.linearRampToValueAtTime(880, audioCtx.currentTime + 0.2); g.gain.exponentialRampToValueAtTime(1e-5, audioCtx.currentTime + 0.3); break;
        }
        o.start(audioCtx.currentTime);
        o.stop(audioCtx.currentTime + 0.3);
    }

    // --- PROGRESS & STORAGE ---
    function getStorageKey() { return state.isGuest ? null : `aiQuizProgress_${state.session.user.email}`; }
    function saveProgress() { const key = getStorageKey(); if (key) localStorage.setItem(key, JSON.stringify(state.userProgress)); }
    function loadProgress() {
        const key = getStorageKey();
        if (!key) { state.userProgress = { totalHints: 30, topics: {} }; return; }
        const saved = localStorage.getItem(key);
        const parsed = saved ? JSON.parse(saved) : {};
        state.userProgress = parsed.totalHints !== undefined ? parsed : { totalHints: 30, topics: parsed };
    }
    function unlockNextLevel(topicTitle, completedLevel) {
        const p = state.userProgress.topics[topicTitle] || { highestLevelUnlocked: 1, scores: {}, history: [] };
        if (completedLevel === p.highestLevelUnlocked && completedLevel < TOTAL_LEVELS) p.highestLevelUnlocked++;
        state.userProgress.topics[topicTitle] = p; saveProgress();
    }
    function recordQuizResult(topicTitle, level, score) {
        const p = state.userProgress.topics[topicTitle] || { highestLevelUnlocked: 1, scores: {}, history: [] };
        p.scores = p.scores || {}; p.history = p.history || [];
        p.scores[level] = Math.max(p.scores[level] || 0, score);
        p.history.push({ level, score, date: new Date().toISOString() });
        state.userProgress.topics[topicTitle] = p; saveProgress();
    }

    // --- API & PRE-FETCHING ---
    async function prefetchQuiz(topic, level) {
        if (!navigator.onLine) return;
        const requestBody = JSON.stringify({ topic: topic.title, level });
        prefetchPromise = fetch('/api/generate-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: requestBody,
        }).then(res => res.json()).catch(err => {
            console.warn("Prefetch failed:", err);
            prefetchPromise = null;
        });
    }

    // --- 3D & BACKGROUNDS ---
    function updateBackground(topicId = null) {
        if (state.is3DMode) {
            dom.appContainer.className = '';
            if (topicId) sceneManager.init(topicId, dom.webglContainer); else sceneManager.destroy();
        } else {
            sceneManager.destroy(); dom.appContainer.className = 'bg-default';
        }
    }
    function set3DMode(enabled) {
        state.is3DMode = enabled; localStorage.setItem('3DModeEnabled', enabled); document.body.classList.toggle('mode-3d', enabled);
        const icon3D = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`;
        const icon2D = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>`;
        dom.toggle3DBtn.innerHTML = enabled ? icon3D : icon2D;
        updateBackground(state.currentTopic ? state.currentTopic.id : null);
        showToast(`3D visuals ${enabled ? 'enabled' : 'disabled'}.`);
    }

    // --- RENDERING LOGIC ---
    function renderHomeScreen() {
        const topicGrid = document.getElementById('topic-grid');
        topicGrid.innerHTML = ''; // Clear existing
    
        // LAZY LOADING SETUP
        const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    const topicId = card.dataset.topicId;
                    const topic = TOPICS.find(t => t.id === topicId);
                    
                    // Populate the card content
                    card.innerHTML = `
                        <div class="icon">${topic.icon}</div>
                        <h3>${topic.title}</h3>
                        <p>Expand your knowledge in ${topic.title}.</p>
                    `;
                    card.classList.add('loaded'); // Add class to prevent re-populating
                    card.addEventListener('click', () => handleTopicSelection(topic));

                    // Parallax effect
                    card.addEventListener('mousemove', (e) => {
                        const rect = card.getBoundingClientRect();
                        const x = e.clientX - rect.left, y = e.clientY - rect.top;
                        const { width, height } = rect;
                        const rotateX = (y / height - 0.5) * -15;
                        const rotateY = (x / width - 0.5) * 15;
                        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
                    });
                    card.addEventListener('mouseleave', () => card.style.transform = 'rotateX(0) rotateY(0) scale(1)');

                    observer.unobserve(card); // Stop observing once loaded
                }
            });
        }, { rootMargin: "0px 0px 100px 0px" }); // Load when 100px from bottom of viewport

        // Create placeholder cards
        TOPICS.forEach(topic => {
            const cardPlaceholder = document.createElement('div');
            cardPlaceholder.className = 'topic-card';
            cardPlaceholder.dataset.topicId = topic.id;
            topicGrid.appendChild(cardPlaceholder);
            lazyLoadObserver.observe(cardPlaceholder);
        });
    }

    function handleTopicSelection(topic) {
        playSound('click');
        state.currentTopic = topic;
        state.gameMode = 'topic';
        navigateTo(Screen.LEVEL);
    }
    
    function renderLevelScreen() {
        document.getElementById('level-topic-title').textContent = state.currentTopic.title;
        const progress = state.userProgress.topics[state.currentTopic.title] || { highestLevelUnlocked: 1, scores: {}, history: [] };
        const completion = Math.floor(((progress.highestLevelUnlocked - 1) / TOTAL_LEVELS) * 100);
        document.getElementById('level-progress-text').textContent = `Progress: ${completion}%`;
        document.getElementById('level-progress-bar').style.width = `${completion}%`;

        const levelGrid = document.getElementById('level-grid');
        levelGrid.innerHTML = Array.from({ length: TOTAL_LEVELS }, (_, i) => {
            const level = i + 1;
            const isUnlocked = level <= progress.highestLevelUnlocked;
            const isCompleted = level < progress.highestLevelUnlocked;
            const statusClass = isCompleted ? 'completed' : isUnlocked ? 'unlocked' : 'locked';
            return `<button class="level-btn ${statusClass}" data-level="${level}" ${!isUnlocked ? 'disabled' : ''}><div class="level-number">${level}</div><div class="level-status">${isCompleted ? 'Done' : isUnlocked ? 'Open' : 'Locked'}</div></button>`;
        }).join('');
        
        levelGrid.querySelectorAll('.unlocked, .completed').forEach(btn => btn.addEventListener('click', () => {
            playSound('click');
            state.currentLevel = parseInt(btn.dataset.level, 10);
            navigateTo(Screen.QUIZ);
        }));
        document.getElementById('current-level-text').textContent = progress.highestLevelUnlocked;

        const historyLog = document.getElementById('history-log');
        const history = (progress.history || []).sort((a,b) => new Date(b.date) - new Date(a.date));
        historyLog.innerHTML = history.length > 0 ? history.map(item => `
            <div class="history-item">
                <div class="history-item-details"><span class="level-tag">Lvl ${item.level}</span> Score: <span class="history-item-score">${item.score} / ${QUESTIONS_PER_QUIZ}</span></div>
                <div class="history-item-date">${new Date(item.date).toLocaleDateString()}</div>
            </div>`).join('') : `<p class="no-history-message">No attempts recorded yet.</p>`;

        // PRE-FETCH next quiz
        if (progress.highestLevelUnlocked <= TOTAL_LEVELS) {
            prefetchQuiz(state.currentTopic, progress.highestLevelUnlocked);
        }
    }
    
    function renderResultsScreen({ score, timedOut }) {
        const titleEl = document.querySelector('#results-screen .screen-title'), subtitleEl = document.getElementById('results-topic-text'), unlockMsg = document.getElementById('unlock-message'), actionButtons = document.getElementById('results-action-buttons');
        
        document.getElementById('final-score-value').textContent = String(score % 1 === 0 ? score : score.toFixed(1));
        document.getElementById('total-questions-value').textContent = String(QUESTIONS_PER_QUIZ);
        document.getElementById('correct-answers').textContent = String(score % 1 === 0 ? score : score.toFixed(1));
        document.getElementById('incorrect-answers').textContent = String(QUESTIONS_PER_QUIZ - score);

        if (state.gameMode === 'timeChallenge') {
            titleEl.textContent = timedOut ? "Time's Up!" : "Challenge Complete!";
            subtitleEl.textContent = "You completed the Time Challenge.";
            unlockMsg.classList.add('hidden');
            actionButtons.innerHTML = `<button id="retry-challenge-btn" class="btn btn-primary">Try Again</button><button id="topics-btn" class="btn btn-secondary">Back to Topics</button>`;
        } else {
            titleEl.textContent = "Level Complete!";
            subtitleEl.textContent = `Performance for ${state.currentTopic.title} - Level ${state.currentLevel}`;
            const unlocked = score >= SCORE_TO_UNLOCK_NEXT_LEVEL;
            if (state.isGuest) unlockMsg.textContent = 'Sign up to save progress and unlock new levels!';
            else if (unlocked) { if (state.currentLevel < TOTAL_LEVELS) playSound('levelUp'); unlockMsg.textContent = state.currentLevel >= TOTAL_LEVELS ? 'Mastered! All levels cleared!' : 'Congratulations! Next Level Unlocked!'; }
            else unlockMsg.textContent = `You need ${SCORE_TO_UNLOCK_NEXT_LEVEL} correct answers to unlock the next level. Try again.`;
            unlockMsg.classList.remove('hidden');
            actionButtons.innerHTML = `${(unlocked && !state.isGuest && state.currentLevel < TOTAL_LEVELS) ? '<button id="next-level-btn" class="btn btn-primary">Next Level</button>' : ''}<button id="retry-btn" class="btn btn-secondary">Retry Level</button><button id="topics-btn" class="btn btn-secondary">Back to Topics</button>`;
        }
    }

    // --- NAVIGATION ---
    async function navigateTo(screenId) {
        state.currentScreen = screenId;
        dom.screens.forEach(s => s.classList.toggle('hidden', s.id !== screenId));
        
        updateBackground(screenId === Screen.HOME ? null : state.currentTopic?.id);
        
        switch (screenId) {
            case Screen.HOME: renderHomeScreen(); break;
            case Screen.LEVEL: renderLevelScreen(); break;
            case Screen.QUIZ:
                if (!quizControllerModule) {
                    showLoading(true, "Loading quiz engine...");
                    quizControllerModule = await import('./quiz_controller.js');
                }
                const quizResult = await quizControllerModule.runQuiz(prefetchPromise, state, dom, { playSound, showLoading, showToast });
                prefetchPromise = null; // Consume the promise
                
                if (quizResult.error) {
                    navigateTo(Screen.LEVEL); // Go back if quiz fails to load
                } else {
                    if (!state.isGuest && state.gameMode === 'topic') {
                        recordQuizResult(state.currentTopic.title, state.currentLevel, quizResult.score);
                        if (quizResult.score >= SCORE_TO_UNLOCK_NEXT_LEVEL) unlockNextLevel(state.currentTopic.title, state.currentLevel);
                    }
                    navigateTo(Screen.RESULTS, quizResult);
                }
                break;
            case Screen.RESULTS: renderResultsScreen(arguments[1]); break;
        }
    }

    // --- INITIALIZATION ---
    function init() {
        document.body.addEventListener('click', () => { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }, { once: true });
        
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') document.body.classList.add('light-mode');
        document.getElementById('theme-toggle-btn').addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
        });

        const webGLSupported = sceneManager.isWebGLAvailable();
        if (webGLSupported) set3DMode(localStorage.getItem('3DModeEnabled') !== 'false');
        else { set3DMode(false); dom.toggle3DBtn.classList.add('disabled'); }
        dom.toggle3DBtn.addEventListener('click', () => set3DMode(!state.is3DMode));
        
        if (!state.session) return;
        state.isGuest = state.session.user === 'guest';
        if (state.isGuest) {
            dom.guestBanner.classList.remove('hidden'); dom.usernameDisplay.textContent = 'Guest';
            dom.appHeader.style.top = '48px'; dom.mainContent.style.paddingTop = `${120 + 48}px`;
        } else {
            dom.usernameDisplay.textContent = state.session.user.username;
        }
        
        loadProgress();
        document.getElementById('logout-btn').addEventListener('click', () => { playSound('click'); window.auth.logout(); });
        document.getElementById('start-time-challenge-btn').addEventListener('click', () => { playSound('click'); state.gameMode = 'timeChallenge'; navigateTo(Screen.QUIZ); });
        
        document.addEventListener('click', e => {
            const btn = e.target.closest('button'); if (!btn) return;
            switch(btn.id) {
                case 'next-level-btn': playSound('click'); state.currentLevel++; navigateTo(Screen.QUIZ); break;
                case 'retry-btn': playSound('click'); navigateTo(Screen.QUIZ); break;
                case 'retry-challenge-btn': playSound('click'); state.gameMode = 'timeChallenge'; navigateTo(Screen.QUIZ); break;
                case 'topics-btn': case 'back-to-topics-btn': playSound('click'); navigateTo(Screen.HOME); break;
                case 'start-current-level-btn':
                    playSound('click');
                    const p = state.userProgress.topics[state.currentTopic.title] || { highestLevelUnlocked: 1 };
                    state.currentLevel = p.highestLevelUnlocked;
                    navigateTo(Screen.QUIZ);
                    break;
            }
        });
        document.querySelector('.logo').addEventListener('click', () => { playSound('click'); navigateTo(Screen.HOME); });
        navigateTo(Screen.HOME);
    }

    init();
});
