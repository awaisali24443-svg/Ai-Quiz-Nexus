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
    return shuffled.slice(0, 10);
}

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


document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    
    const TOTAL_LEVELS = 30;
    const SCORE_TO_UNLOCK_NEXT_LEVEL = 7;
    const PFP_MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

    const Screen = {
        HOME: 'home-screen',
        LEVEL: 'level-screen',
        QUIZ: 'quiz-screen',
        RESULTS: 'results-screen',
        PROFILE: 'profile-screen',
    };
    
    const dom = {
        appContainer: document.getElementById('app-container'),
        screens: document.querySelectorAll('.screen'),
        loadingOverlay: document.getElementById('loading-overlay'),
        loadingText: document.getElementById('loading-text'),
        toastContainer: document.getElementById('toast-container'),
        guestBanner: document.getElementById('guest-banner'),
        appHeader: document.getElementById('app-header'),
        mainContent: document.querySelector('main'),
        profileButton: document.getElementById('profile-button'),
        profilePicImg: document.getElementById('profile-picture-img'),
        profileAvatarDefault: document.getElementById('profile-avatar-default'),
        hintCounterDisplay: document.getElementById('hint-counter-display'),
        quizTimer: document.getElementById('quiz-timer'),
        questionCounter: document.getElementById('question-counter'),
        quizHintBtn: document.getElementById('hint-btn'),
        quizHintsLeft: document.getElementById('hints-left'),
        quizProgressBar: document.getElementById('quiz-progress-bar'),
        questionText: document.getElementById('question-text'),
        optionsContainer: document.getElementById('options-container'),
        webGLContainer: document.getElementById('webgl-container')
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
        newPfpData: null,
    };

    let audioCtx;
    let prefetchPromise = null;
    let quizControllerModule = null;

    // --- UTILITIES ---
    function showToast(message, isError = false) {
        const toast = document.createElement('div');
        toast.className = `toast ${isError ? 'error' : ''}`;
        toast.textContent = message;
        dom.toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('hiding');
            toast.addEventListener('animationend', () => toast.remove());
        }, 3000);
    }

    function showLoading(show, text = 'Loading...') {
        dom.loadingOverlay.classList.toggle('hidden', !show);
        dom.loadingText.textContent = text;
    }

    function playSound(type) {
        if (!audioCtx) return;
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

        switch (type) {
            case 'correct':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
                gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
                break;
            case 'incorrect':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(164.81, audioCtx.currentTime); // E3
                gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
                break;
            case 'click':
            default:
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
                break;
        }
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);
    }

    // --- PROGRESS & STORAGE ---
    function getStorageKey() { return state.isGuest ? null : `aiQuizProgress_${state.session.user.email}`; }
    function saveProgress() { if (!state.isGuest) localStorage.setItem(getStorageKey(), JSON.stringify(state.userProgress)); }
    function loadProgress() {
        if (state.isGuest) { state.userProgress = { totalHints: 30, topics: {} }; return; }
        const saved = localStorage.getItem(getStorageKey());
        if (saved) {
            try { state.userProgress = JSON.parse(saved); } catch (e) { console.error("Could not parse user progress", e); }
        }
        if (typeof state.userProgress.totalHints !== 'number') state.userProgress.totalHints = 30;
    }
    function unlockNextLevel(topicTitle, completedLevel) {
        const p = state.userProgress.topics[topicTitle] || { highestLevelUnlocked: 1, history: [] };
        if (completedLevel === p.highestLevelUnlocked && completedLevel < TOTAL_LEVELS) p.highestLevelUnlocked++;
        state.userProgress.topics[topicTitle] = p; saveProgress();
    }
    function recordQuizResult(topicTitle, level, score, questions) {
        const p = state.userProgress.topics[topicTitle] || { highestLevelUnlocked: 1, history: [] };
        p.history = p.history || [];
        p.history.push({ level, score, date: new Date().toISOString(), questions: questions.map(q => ({q: q.q, answer: q.answer})) }); // only save q and answer
        state.userProgress.topics[topicTitle] = p; saveProgress();
    }

    // --- API & PRE-FETCHING ---
    async function prefetchQuiz(topic, level) {
        if (!navigator.onLine || state.isGuest) return;
        const body = { topic: topic.title, level: level, answeredQuestions: [] };
        prefetchPromise = fetch('/api/generate-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        }).then(res => res.ok ? res.json() : Promise.reject('Prefetch failed'));
        prefetchPromise.catch(() => { prefetchPromise = null; });
    }
    
    // --- 3D, THEME, BACKGROUNDS ---
    function updateBackground(topicId = null) {
        let newClass = 'bg-default';
        if (topicId) newClass = `bg-${topicId}`;
        dom.appContainer.className = newClass;
        if (state.is3DMode && sceneManager.isWebGLAvailable()) {
            document.body.classList.add('mode-3d');
            sceneManager.init(topicId || 'world_knowledge', dom.webGLContainer);
        } else {
            document.body.classList.remove('mode-3d');
            sceneManager.destroy();
        }
    }

    function set3DMode(enabled) {
        state.is3DMode = enabled;
        localStorage.setItem('3dMode', enabled);
        document.getElementById('toggle-3d-btn').title = enabled ? 'Disable 3D Visuals' : 'Enable 3D Visuals';
        updateBackground(state.currentTopic?.id);
    }
    
    // --- RENDERING & UI ---
    function renderHomeScreen() {
        const topicGrid = document.getElementById('topic-grid');
        topicGrid.innerHTML = '';

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        TOPICS.forEach(topic => {
            const card = document.createElement('div');
            card.className = 'topic-card';
            card.dataset.topicId = topic.id;
            card.innerHTML = `<div class="icon">${topic.icon}</div><div><h3>${topic.title}</h3></div>`;
            card.addEventListener('click', () => handleTopicSelection(topic));
            topicGrid.appendChild(card);
            observer.observe(card);
        });
    }

    function handleTopicSelection(topic) {
        playSound('click');
        state.currentTopic = topic;
        state.gameMode = 'topic';
        navigateTo(Screen.LEVEL);
    }

    function renderLevelScreen() {
        if (!state.currentTopic) { navigateTo(Screen.HOME); return; }
        
        const { title } = state.currentTopic;
        const progress = state.userProgress.topics[title] || { highestLevelUnlocked: 1, history: [] };
        const levelGrid = document.getElementById('level-grid');
        levelGrid.innerHTML = '';

        document.getElementById('level-topic-title').textContent = title;
        document.getElementById('level-progress-bar').style.width = `${(progress.highestLevelUnlocked - 1) / TOTAL_LEVELS * 100}%`;
        document.getElementById('level-progress-text').textContent = `You have unlocked level ${progress.highestLevelUnlocked} of ${TOTAL_LEVELS}.`;
        document.getElementById('current-level-text').textContent = progress.highestLevelUnlocked;

        for (let i = 1; i <= TOTAL_LEVELS; i++) {
            const btn = document.createElement('button');
            btn.className = 'level-btn';
            btn.innerHTML = `<div class="level-number">${i}</div>`;
            if (i < progress.highestLevelUnlocked) {
                btn.classList.add('completed');
                btn.innerHTML += `<div class="level-status">Done</div>`;
            } else if (i === progress.highestLevelUnlocked) {
                btn.classList.add('unlocked');
                btn.innerHTML += `<div class="level-status">Next</div>`;
            } else {
                btn.classList.add('locked');
                btn.disabled = true;
            }
            if (i === progress.highestLevelUnlocked) {
                btn.addEventListener('click', () => { playSound('click'); state.currentLevel = i; navigateTo(Screen.QUIZ); });
            }
            levelGrid.appendChild(btn);
        }
        prefetchQuiz(state.currentTopic, progress.highestLevelUnlocked);

        // Render history
        const historyLog = document.getElementById('history-log');
        historyLog.innerHTML = '';
        if (progress.history && progress.history.length > 0) {
            const reversedHistory = [...progress.history].reverse().slice(0, 10);
            reversedHistory.forEach(item => {
                const div = document.createElement('div');
                div.className = 'history-item';
                div.innerHTML = `
                    <div class="history-item-details"><span class="level-tag">Lvl ${item.level}</span> ${new Date(item.date).toLocaleDateString()}</div>
                    <div class="history-item-score">${item.score} / 10</div>`;
                historyLog.appendChild(div);
            });
        } else {
            historyLog.innerHTML = `<p class="no-history-message">No attempts recorded for this topic yet.</p>`;
        }
    }
    
    function renderResultsScreen({ score, timedOut }) {
        document.getElementById('final-score-value').textContent = score;
        document.getElementById('correct-answers').textContent = score;
        document.getElementById('incorrect-answers').textContent = 10 - score;
        document.getElementById('results-topic-text').textContent = state.gameMode === 'topic' ? `${state.currentTopic.title} - Level ${state.currentLevel}` : 'Time Challenge';
        
        const buttonsContainer = document.getElementById('results-action-buttons');
        const unlockMsg = document.getElementById('unlock-message');
        unlockMsg.classList.add('hidden');

        if (state.gameMode === 'topic') {
            const canAdvance = score >= SCORE_TO_UNLOCK_NEXT_LEVEL && state.currentLevel < TOTAL_LEVELS;
            if (canAdvance) {
                unlockMsg.textContent = `🎉 You've unlocked Level ${state.currentLevel + 1}!`;
                unlockMsg.classList.remove('hidden');
            }
            buttonsContainer.innerHTML = `
                ${canAdvance ? '<button id="next-level-btn" class="btn btn-primary">Next Level</button>' : ''}
                <button id="retry-btn" class="btn btn-secondary">Retry Level</button>
                <button id="topics-btn" class="btn btn-secondary">Back to Topics</button>`;
        } else {
            buttonsContainer.innerHTML = `
                <button id="retry-challenge-btn" class="btn btn-primary">Try Again</button>
                <button id="topics-btn" class="btn btn-secondary">Back to Topics</button>`;
        }
    }

    function updateProfilePictureUI(profilePicture, username) {
        if (profilePicture) {
            dom.profilePicImg.src = profilePicture;
            dom.profilePicImg.classList.remove('hidden');
            dom.profileAvatarDefault.classList.add('hidden');
        } else {
            dom.profilePicImg.classList.add('hidden');
            dom.profileAvatarDefault.classList.remove('hidden');
            const initials = username.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            dom.profileAvatarDefault.textContent = initials;
        }
    }

    function renderProfileScreen() {
        if (state.isGuest) { navigateTo(Screen.HOME); return; }
        const { username, email, profilePicture } = state.session.user;
        
        const profilePreviewImg = document.getElementById('profile-preview-img');
        const profilePreviewDefault = document.getElementById('profile-preview-default');
        
        document.getElementById('profile-username').value = username;
        document.getElementById('profile-email').value = email;

        if (profilePicture) {
            profilePreviewImg.src = profilePicture;
            profilePreviewImg.classList.remove('hidden');
            profilePreviewDefault.classList.add('hidden');
        } else {
            profilePreviewImg.classList.add('hidden');
            profilePreviewDefault.classList.remove('hidden');
            const initials = username.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            profilePreviewDefault.textContent = initials;
        }
    }

    // --- NAVIGATION ---
    async function navigateTo(screenId, data = {}) {
        state.currentScreen = screenId;
        dom.screens.forEach(s => s.classList.toggle('hidden', s.id !== screenId));
        
        updateBackground(screenId === Screen.LEVEL || screenId === Screen.QUIZ ? state.currentTopic?.id : null);
        
        switch (screenId) {
            case Screen.HOME: renderHomeScreen(); break;
            case Screen.LEVEL: renderLevelScreen(); break;
            case Screen.PROFILE: renderProfileScreen(); break;
            case Screen.QUIZ:
                if (!quizControllerModule) {
                    showLoading(true, "Loading quiz engine...");
                    quizControllerModule = await import('./quiz_controller.js');
                }
                const progress = state.userProgress.topics[state.currentTopic?.title] || { history: [] };
                const answeredQuestions = (progress.history || []).flatMap(h => h.questions.map(q => q.q));

                const quizResult = await quizControllerModule.runQuiz(prefetchPromise, state, dom, { playSound, showLoading, showToast }, answeredQuestions);
                prefetchPromise = null;
                
                if (quizResult.error) {
                    navigateTo(Screen.LEVEL);
                } else {
                    if (!state.isGuest && state.gameMode === 'topic') {
                        recordQuizResult(state.currentTopic.title, state.currentLevel, quizResult.score, quizResult.questions);
                        if (quizResult.score >= SCORE_TO_UNLOCK_NEXT_LEVEL) unlockNextLevel(state.currentTopic.title, state.currentLevel);
                        saveProgress();
                    }
                    navigateTo(Screen.RESULTS, quizResult);
                }
                break;
            case Screen.RESULTS: renderResultsScreen(data); break;
        }
    }

    // --- EVENT HANDLERS ---
    function setupProfileEventHandlers() {
        document.getElementById('pfp-upload-btn').addEventListener('click', () => document.getElementById('pfp-upload-input').click());
        document.getElementById('pfp-upload-input').addEventListener('change', (e) => {
            const file = e.target.files[0]; if (!file) return;
            if (file.size > PFP_MAX_SIZE_BYTES) { showToast('Image is too large. Max 2MB allowed.', true); return; }
            const reader = new FileReader();
            reader.onload = () => {
                state.newPfpData = reader.result;
                document.getElementById('profile-preview-img').src = state.newPfpData;
                document.getElementById('profile-preview-img').classList.remove('hidden');
                document.getElementById('profile-preview-default').classList.add('hidden');
            };
            reader.readAsDataURL(file);
        });

        document.getElementById('profile-form').addEventListener('submit', async (e) => {
            e.preventDefault(); if (state.isGuest) return;
            showLoading(true, "Updating profile...");
            try {
                const newUsername = document.getElementById('profile-username').value;
                const body = { email: state.session.user.email, newUsername: newUsername, newProfilePicture: state.newPfpData };
                const response = await fetch('/api/update-profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                const updatedUser = await response.json();
                if (!response.ok) throw new Error(updatedUser.message);

                window.auth.saveSession(updatedUser);
                state.session = window.auth.getSession();
                updateProfilePictureUI(updatedUser.profilePicture, updatedUser.username);
                state.newPfpData = null;
                showToast('Profile updated successfully!');
                navigateTo(Screen.HOME);
            } catch (error) { showToast(`Update failed: ${error.message}`, true);
            } finally { showLoading(false); }
        });

        document.getElementById('password-form').addEventListener('submit', async (e) => {
            e.preventDefault(); if (state.isGuest) return;
            const oldPassword = document.getElementById('old-password').value;
            const newPassword = document.getElementById('new-password').value;
            if (newPassword !== document.getElementById('confirm-new-password').value) { showToast("New passwords do not match.", true); return; }
            showLoading(true, "Changing password...");
            try {
                const response = await fetch('/api/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: state.session.user.email, oldPassword, newPassword }) });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message);
                showToast('Password changed successfully!');
                e.target.reset();
            } catch (error) { showToast(`Error: ${error.message}`, true);
            } finally { showLoading(false); }
        });
    }

    // --- INITIALIZATION ---
    function init() {
        document.body.addEventListener('click', () => { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }, { once: true });
        
        const themeToggleButton = document.getElementById('theme-toggle-btn');
        const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
        const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
        if (localStorage.getItem('theme') === 'light') { document.body.classList.add('light-mode'); themeToggleButton.innerHTML = moonIcon; } else { themeToggleButton.innerHTML = sunIcon; }
        themeToggleButton.addEventListener('click', () => {
            playSound('click');
            const isLight = document.body.classList.toggle('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            themeToggleButton.innerHTML = isLight ? moonIcon : sunIcon;
        });
        
        const toggle3dBtn = document.getElementById('toggle-3d-btn');
        const visualsIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`;
        toggle3dBtn.innerHTML = visualsIcon;
        if (!sceneManager.isWebGLAvailable()) {
            toggle3dBtn.disabled = true;
            toggle3dBtn.classList.add('disabled');
            state.is3DMode = false;
        } else {
            const saved3dMode = localStorage.getItem('3dMode');
            set3DMode(saved3dMode !== 'false');
            toggle3dBtn.addEventListener('click', () => set3DMode(!state.is3DMode));
        }

        if (!state.session) return;
        state.isGuest = state.session.user === 'guest';
        if (state.isGuest) {
            dom.guestBanner.classList.remove('hidden');
            updateProfilePictureUI(null, 'Guest');
            dom.appHeader.style.top = '48px'; dom.mainContent.style.paddingTop = `${120 + 48}px`;
            dom.hintCounterDisplay.classList.add('hidden');
        } else {
            updateProfilePictureUI(state.session.user.profilePicture, state.session.user.username);
            dom.hintCounterDisplay.querySelector('span').textContent = state.userProgress.totalHints;
        }
        
        loadProgress();
        setupProfileEventHandlers();
        dom.profileButton.addEventListener('click', () => { if (!state.isGuest) navigateTo(Screen.PROFILE); });
        document.getElementById('logout-btn').addEventListener('click', () => { playSound('click'); window.auth.logout(); });
        document.getElementById('start-time-challenge-btn').addEventListener('click', () => { playSound('click'); state.gameMode = 'timeChallenge'; navigateTo(Screen.QUIZ); });
        
        document.addEventListener('click', e => {
            const btn = e.target.closest('button'); if (!btn) return;
            switch(btn.id) {
                case 'next-level-btn': playSound('click'); state.currentLevel++; navigateTo(Screen.QUIZ); break;
                case 'retry-btn': playSound('click'); navigateTo(Screen.QUIZ); break;
                case 'retry-challenge-btn': playSound('click'); state.gameMode = 'timeChallenge'; navigateTo(Screen.QUIZ); break;
                case 'topics-btn': case 'back-to-topics-btn': case 'back-to-dashboard-btn': playSound('click'); navigateTo(Screen.HOME); break;
                case 'start-current-level-btn':
                    playSound('click');
                    const p = state.userProgress.topics[state.currentTopic.title] || { highestLevelUnlocked: 1 };
                    state.currentLevel = p.highestLevelUnlocked;
                    navigateTo(Screen.QUIZ);
                    break;
            }
        });
        document.querySelector('.logo').addEventListener('click', () => { playSound('click'); navigateTo(Screen.HOME); });

        setInterval(() => {
            fetch('/api/ping').catch(err => console.log("Keep-alive ping failed:", err));
        }, 4 * 60 * 1000); // Every 4 minutes

        navigateTo(Screen.HOME);
    }

    init();
});