
import sceneManager from './3d/sceneManager.js';
import { SupabaseClient } from './supabase-client.js';

// This function is exported so the dynamically loaded module can use it.
export function getFallbackQuestions(topicTitle, level) {
    const topic = TOPICS.find(t => t.title === topicTitle);
    const topicId = topic ? topic.id : topicTitle.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_');
    if (!topic || !window.QUIZ_DATA || !window.QUIZ_DATA[topicId]) {
        console.error(`No fallback questions available for topic: ${topicTitle}`);
        throw new Error('Failed to load quiz questions for this topic. Please try again later.');
    }

    const topicData = window.QUIZ_DATA[topicId];
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
    { id: 'programming', title: 'Programming Languages', description: 'Test your knowledge in syntax, algorithms, and data structures across various languages.' },
    { id: 'technology_ai', title: 'AI & Technology', description: 'Explore concepts of machine learning, neural networks, and modern tech innovations.' },
    { id: 'space_astronomy', title: 'Space & Astronomy', description: 'Journey through the cosmos, from planets and stars to galaxies and black holes.' },
    { id: 'biology', title: 'Chemistry', description: 'Delve into the world of atoms, molecules, reactions, and the periodic table.' },
    { id: 'science_inventions', title: 'Physics', description: 'Challenge your understanding of motion, energy, forces, and the fundamental laws of the universe.' },
    { id: 'world_knowledge', title: 'World Knowledge', description: 'Test your general knowledge about global geography, cultures, and current events.' },
    { id: 'history_geography', title: 'History', description: 'Travel back in time and test your knowledge of major historical events, figures, and civilizations.' },
    { id: 'science_inventions', title: 'Science Inventions', description: 'Learn about the groundbreaking inventions and discoveries that shaped our world.' },
    { id: 'biology', title: 'Biology', description: 'Explore the mysteries of life, from cellular structures to complex ecosystems.' },
    { id: 'space_astronomy', title: 'Time Challenge', description: 'A fast-paced quiz with random questions from all topics. How high can you score?', isChallenge: true },
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
        session: null,
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
    function getStorageKey() { return state.isGuest ? 'guest_progress' : `aiQuizProgress_${state.session.user.id}`; }

    async function saveProgress() {
        const storageKey = getStorageKey();
        if (!storageKey) return;
        
        console.log(`Saving progress for ${state.isGuest ? 'guest' : 'user'}...`);
        localStorage.setItem(storageKey, JSON.stringify(state.userProgress));

        if (!state.isGuest) {
            await SupabaseClient.saveUserProgress(state.session.user.id, state.userProgress);
        }
    }

    async function loadProgress() {
        if (state.isGuest) {
            const saved = localStorage.getItem(getStorageKey());
            if (saved) {
                try {
                    state.userProgress = JSON.parse(saved);
                    console.log('Guest progress loaded from localStorage.');
                } catch (e) {
                    console.error("Could not parse local guest progress", e);
                    state.userProgress = { totalHints: 0, topics: {} };
                }
            } else {
                 state.userProgress = { totalHints: 0, topics: {} }; // Guests don't get hints
            }
             // Ensure progress object has the right structure
            if (typeof state.userProgress.totalHints !== 'number') {
                state.userProgress.totalHints = 0;
            }
            if (typeof state.userProgress.topics !== 'object') {
                state.userProgress.topics = {};
            }
            return;
        }

        let progress = null;
        if (navigator.onLine) {
            progress = await SupabaseClient.loadUserProgress(state.session.user.id);
        }

        if (!progress) {
            const saved = localStorage.getItem(getStorageKey());
            if (saved) {
                try { 
                    progress = JSON.parse(saved);
                    console.log('User progress loaded from localStorage fallback.');
                } catch (e) { console.error("Could not parse local progress", e); }
            }
        }

        state.userProgress = progress || { totalHints: 30, topics: {} };
        if (typeof state.userProgress.totalHints !== 'number') {
            state.userProgress.totalHints = 30;
        }
    }

    async function unlockNextLevel(topicTitle, completedLevel) {
        const p = state.userProgress.topics[topicTitle] || { highestLevelUnlocked: 1, history: [] };
        if (completedLevel === p.highestLevelUnlocked && completedLevel < TOTAL_LEVELS) {
            p.highestLevelUnlocked++;
            console.log(`Level ${p.highestLevelUnlocked} unlocked for topic ${topicTitle}.`);
        }
        state.userProgress.topics[topicTitle] = p;
        await saveProgress();
    }
    
    async function recordQuizResult(topicTitle, level, score, questions) {
        const p = state.userProgress.topics[topicTitle] || { highestLevelUnlocked: 1, history: [] };
        p.history = p.history || [];
        p.history.push({ level, score, date: new Date().toISOString(), questions: questions.map(q => ({q: q.q, answer: q.answer})) });
        state.userProgress.topics[topicTitle] = p;
        console.log(`Result recorded for ${topicTitle} Level ${level}: Score ${score}`);
        await saveProgress();
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
        const toggleBtn = document.querySelector('.theme-toggle-btn[aria-label*="3D"]');
        if(toggleBtn) toggleBtn.title = enabled ? 'Disable 3D Visuals' : 'Enable 3D Visuals';
        updateBackground(state.currentTopic?.id);
    }
    
    // --- RENDERING & UI ---
    function renderHomeScreen() {
        console.log("Rendering home screen...");
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

        TOPICS.forEach((topic, index) => {
            const card = document.createElement('div');
            card.className = 'topic-card';
            card.dataset.topicId = topic.id;
            card.style.transitionDelay = `${index * 50}ms`;
            card.innerHTML = `
                <div class="topic-card-content">
                    <h3>${topic.title}</h3>
                    <p>${topic.description}</p>
                </div>`;
            card.addEventListener('click', () => handleTopicSelection(topic));
            topicGrid.appendChild(card);
            observer.observe(card);
        });
    }

    function handleTopicSelection(topic) {
        playSound('click');
        state.currentTopic = topic;

        if (topic.isChallenge) {
            console.log("Time Challenge selected.");
            state.gameMode = 'timeChallenge';
            navigateTo(Screen.QUIZ);
        } else {
            console.log(`Topic selected: ${topic.title}`);
            state.gameMode = 'topic';
            navigateTo(Screen.LEVEL);
        }
    }

    function renderLevelScreen() {
        if (!state.currentTopic) { navigateTo(Screen.HOME); return; }
        
        console.log(`Rendering level screen for ${state.currentTopic.title}`);
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
        console.log("Rendering results screen.");
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

    function updateProfilePictureUI(profilePictureUrl, username) {
        if (profilePictureUrl) {
            dom.profilePicImg.src = profilePictureUrl;
            dom.profilePicImg.classList.remove('hidden');
            dom.profileAvatarDefault.classList.add('hidden');
            
            document.getElementById('profile-preview-img').src = profilePictureUrl;
            document.getElementById('profile-preview-img').classList.remove('hidden');
            document.getElementById('profile-preview-default').classList.add('hidden');
        } else {
            dom.profilePicImg.classList.add('hidden');
            dom.profileAvatarDefault.classList.remove('hidden');
            const initials = (username || 'G').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            dom.profileAvatarDefault.textContent = initials;
            
            document.getElementById('profile-preview-img').classList.add('hidden');
            document.getElementById('profile-preview-default').classList.remove('hidden');
            document.getElementById('profile-preview-default').textContent = initials;
        }
    }

    function renderProfileScreen() {
        if (state.isGuest) { navigateTo(Screen.HOME); return; }
        const { username, email, profile_picture_url } = state.session.user;
        
        document.getElementById('profile-username').value = username;
        document.getElementById('profile-email').value = email;
        updateProfilePictureUI(profile_picture_url, username);
    }

    // --- NAVIGATION ---
    async function navigateTo(screenId, data = {}) {
        if (state.currentScreen === Screen.QUIZ && quizControllerModule) {
            quizControllerModule.cleanupQuiz();
        }

        console.log(`Navigating to screen: ${screenId}`);
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

                const quizResult = await quizControllerModule.runQuiz(prefetchPromise, state, dom, { playSound, showLoading, showToast, getFallbackQuestions }, answeredQuestions);
                prefetchPromise = null;
                
                if (quizResult.error) {
                    navigateTo(Screen.LEVEL);
                } else {
                    if (!state.isGuest && state.gameMode === 'topic') {
                        await recordQuizResult(state.currentTopic.title, state.currentLevel, quizResult.score, quizResult.questions);
                        if (quizResult.score >= SCORE_TO_UNLOCK_NEXT_LEVEL) {
                            await unlockNextLevel(state.currentTopic.title, state.currentLevel);
                        }
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
                let pfpUrl = state.session.user.profile_picture_url;

                if (state.newPfpData) {
                    const { data: uploadData, error: uploadError } = await SupabaseClient.uploadProfilePicture(state.session.user.id, state.newPfpData);
                    if (uploadError) throw uploadError;
                    pfpUrl = uploadData.publicUrl;
                }

                const { data: updatedUser, error: updateError } = await SupabaseClient.updateProfileAndUser(state.session.user.id, { username: newUsername, profile_picture_url: pfpUrl });
                if (updateError) throw updateError;
                
                state.session.user = { ...state.session.user, ...updatedUser.user_metadata, profile_picture_url: pfpUrl, username: newUsername };

                showToast('Profile updated successfully!');
                updateProfilePictureUI(pfpUrl, newUsername);
                state.newPfpData = null;
            } catch (error) { 
                showToast(`Update failed: ${error.message}`, true);
            } finally { 
                showLoading(false); 
            }
        });

        document.getElementById('password-form').addEventListener('submit', async (e) => {
            e.preventDefault(); if (state.isGuest) return;
            const oldPassword = document.getElementById('old-password').value;
            const newPassword = document.getElementById('new-password').value;
            
            if (newPassword !== document.getElementById('confirm-new-password').value) {
                showToast("New passwords do not match.", true);
                return;
            }
            if (!oldPassword) {
                showToast("Old password is required to verify your identity.", true);
                return;
            }

            showLoading(true, "Changing password...");
            try {
                const { error: reauthError } = await SupabaseClient.signIn(state.session.user.email, oldPassword);
                if (reauthError) throw new Error("Incorrect old password.");
                
                const { error: updateError } = await SupabaseClient.updateUserPassword(newPassword);
                if (updateError) throw updateError;
                
                showToast('Password changed successfully!');
                e.target.reset();
            } catch (error) { 
                showToast(`Error: ${error.message}`, true);
            } finally { 
                showLoading(false);
            }
        });
    }

    // --- INITIALIZATION ---
    async function init() {
        console.log("Initializing dashboard...");
        document.body.addEventListener('click', () => { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }, { once: true });
        
        const toggle3dBtn = document.querySelector('.theme-toggle-btn[aria-label*="3D"]');
        if (toggle3dBtn) {
            if (!sceneManager.isWebGLAvailable()) {
                toggle3dBtn.disabled = true;
                toggle3dBtn.classList.add('disabled');
                state.is3DMode = false;
            } else {
                const saved3dMode = localStorage.getItem('3dMode');
                set3DMode(saved3dMode !== 'false');
                toggle3dBtn.addEventListener('click', () => set3DMode(!state.is3DMode));
            }
        }
        
        state.session = await window.auth.getSession();
        if (!state.session) { 
            console.error("Initialization failed: No session found.");
            return;
        }

        state.isGuest = state.session.user?.guest === true;
        if (state.isGuest) {
            console.log("Running in Guest Mode.");
            dom.guestBanner.classList.remove('hidden');
            dom.guestBanner.innerHTML = `<p>You are in Guest Mode — progress is saved locally. <a href="/signup.html">Sign up</a> to save to the cloud!</p>`;
            updateProfilePictureUI(null, 'Guest');
            dom.appHeader.style.top = '48px'; 
            dom.mainContent.style.paddingTop = '128px';
        } else {
            console.log(`User ${state.session.user.email} is logged in.`);
            // Check if a profile exists for the user. If not, this is their first login.
            const { data: profile } = await SupabaseClient.supabase
                .from('profiles')
                .select('username')
                .eq('id', state.session.user.id)
                .single();
            
            if (!profile) {
                console.log('Profile not found, creating one for new user.');
                const username = state.session.user.user_metadata?.username || state.session.user.email.split('@')[0];
                const { error: insertError } = await SupabaseClient.supabase.from('profiles').insert({
                    id: state.session.user.id,
                    username: username,
                    email: state.session.user.email,
                });

                if (insertError) {
                    console.error('Error creating profile on first login:', insertError);
                    showToast(`Could not create your profile: ${insertError.message}`, true);
                } else {
                    state.session = await window.auth.getSession(true);
                }
            }
    
            updateProfilePictureUI(state.session.user.profile_picture_url, state.session.user.username);
        }
        await loadProgress();
        
        setupProfileEventHandlers();
        
        document.getElementById('logout-btn').addEventListener('click', () => window.auth.logout());
        document.getElementById('profile-nav-link').addEventListener('click', (e) => { e.preventDefault(); if (!state.isGuest) navigateTo(Screen.PROFILE); });
        document.getElementById('settings-nav-link').addEventListener('click', (e) => { e.preventDefault(); if (!state.isGuest) navigateTo(Screen.PROFILE); });
        dom.profileButton.addEventListener('click', () => { if (!state.isGuest) navigateTo(Screen.PROFILE); });
        
        document.querySelectorAll('.mobile-nav .nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetScreen = btn.dataset.screen;
                if(targetScreen) {
                    if (targetScreen === 'profile-screen' && state.isGuest) {
                        showToast('Please sign up to access profile.', true);
                    } else {
                       navigateTo(targetScreen);
                    }
                }
            });
        });

        document.addEventListener('click', e => {
            const btn = e.target.closest('button'); if (!btn) return;
            switch(btn.id) {
                case 'next-level-btn': playSound('click'); state.currentLevel++; navigateTo(Screen.QUIZ); break;
                case 'retry-btn': playSound('click'); navigateTo(Screen.QUIZ); break;
                case 'retry-challenge-btn': playSound('click'); handleTopicSelection({ isChallenge: true }); break;
                case 'topics-btn': case 'back-to-topics-btn': case 'back-to-dashboard-btn': playSound('click'); navigateTo(Screen.HOME); break;
                case 'start-current-level-btn':
                    playSound('click');
                    const p = state.userProgress.topics[state.currentTopic.title] || { highestLevelUnlocked: 1 };
                    state.currentLevel = p.highestLevelUnlocked;
                    navigateTo(Screen.QUIZ);
                    break;
            }
        });
        document.querySelector('.logo').addEventListener('click', (e) => { e.preventDefault(); playSound('click'); navigateTo(Screen.HOME); });

        setInterval(() => { fetch('/api/ping').catch(() => {}); }, 4 * 60 * 1000);

        navigateTo(Screen.HOME);
    }

    init();
});