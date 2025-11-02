
import sceneManager from './3d/sceneManager.js';
import { state, Screen, SCORE_TO_UNLOCK_NEXT_LEVEL } from './state.js';
import { dom } from './dom.js';
import { loadProgress, recordQuizResult, unlockNextLevel, checkAndUnlockAchievements } from './progress.js';
import { renderHomeScreen, renderLevelScreen, renderResultsScreen, renderProfileScreen } from './ui.js';
import { showLoading, showToast, initAudio, playSound } from './utils.js';
import { initEventListeners } from './events.js';
import { getFallbackQuestions } from './questions-handler.js';
import { checkAuth, logout } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    
    let quizControllerModule = null;
    let lastQuizData = null;

    function updateAuthUI(user) {
        const usernameDisplay = document.getElementById('username-display');
        const authActionButton = document.getElementById('auth-action-btn');
        const profileNavBtn = document.querySelector('.nav-item[data-screen="profile-screen"]');
        const settingsContainer = document.querySelector('.settings-container');

        if (user.isGuest) {
            dom.guestBanner.classList.remove('hidden');
            const bannerHeight = dom.guestBanner.offsetHeight || 50;
            dom.appHeader.style.top = `${bannerHeight}px`;
            dom.mainContent.style.paddingTop = `${100 + bannerHeight}px`;
            usernameDisplay.textContent = 'Guest';
            authActionButton.textContent = 'Login';
            authActionButton.onclick = () => { window.location.href = '/login.html'; };
            if (profileNavBtn) profileNavBtn.classList.add('hidden');
            if (settingsContainer) settingsContainer.classList.add('hidden');
        } else {
            dom.guestBanner.classList.add('hidden');
            dom.appHeader.style.top = '0px';
            dom.mainContent.style.paddingTop = '100px';
            usernameDisplay.textContent = user.username;
            authActionButton.textContent = 'Logout';
            authActionButton.onclick = () => logout();
            if (profileNavBtn) profileNavBtn.classList.remove('hidden');
            if (settingsContainer) settingsContainer.classList.remove('hidden');
        }
    }

    async function updateBackground(topicId = null) {
        if (state.is3DMode && sceneManager.isWebGLAvailable()) {
            document.body.classList.add('mode-3d');
            await sceneManager.init(topicId || 'world_knowledge', dom.webGLContainer);
        } else {
            document.body.classList.remove('mode-3d');
            sceneManager.destroy();
        }
    }

    function set3DMode(enabled) {
        state.is3DMode = enabled;
        localStorage.setItem('3dMode', enabled);
        const toggleBtn = document.getElementById('toggle-3d-btn');
        if(toggleBtn) {
            toggleBtn.querySelector('span').textContent = enabled ? '3D Background' : '2D Background';
            toggleBtn.classList.toggle('active', enabled);
        }
        showLoading(true, "Switching visuals...");
        updateBackground(state.currentTopic?.id).finally(() => showLoading(false));
    }

    function handleTopicSelection(topic) {
        playSound('click');
        state.currentTopic = topic;

        if (topic.isChallenge) {
            state.gameMode = 'timeChallenge';
            state.currentLevel = 1;
            navigateTo(Screen.QUIZ);
        } else {
            state.gameMode = 'topic';
            const progress = state.userProgress.topics[topic.title] || { highestLevelUnlocked: 1 };
            state.currentLevel = progress.highestLevelUnlocked;
            navigateTo(Screen.LEVEL);
        }
    }

    async function navigateTo(screenId, data = {}) {
        if (state.currentScreen === Screen.QUIZ && quizControllerModule) {
            quizControllerModule.cleanupQuiz();
        }

        console.log(`Navigating to screen: ${screenId}`);
        state.currentScreen = screenId;
        dom.screens.forEach(s => s.classList.toggle('hidden', s.id !== screenId));
        dom.mobileNavItems.forEach(item => {
            item.classList.toggle('active', item.dataset.screen === screenId);
        });
        
        showLoading(true, "Loading...");
        const backgroundTopicId = (screenId === Screen.LEVEL || screenId === Screen.QUIZ) && state.currentTopic ? state.currentTopic.id : 'default';
        dom.appContainer.className = backgroundTopicId ? `bg-${backgroundTopicId}` : 'bg-default';
        await updateBackground(backgroundTopicId);
        showLoading(false);
        
        switch (screenId) {
            case Screen.HOME: 
                renderHomeScreen(handleTopicSelection); 
                break;
            case Screen.PROFILE:
                if (state.user.isGuest) { navigateTo(Screen.HOME); break; }
                await renderProfileScreen();
                break;
            case Screen.LEVEL: 
                renderLevelScreen(); 
                break;
            case Screen.QUIZ:
                if (!quizControllerModule) {
                    showLoading(true, "Loading quiz engine...");
                    quizControllerModule = await import('./quiz_controller.js');
                }
                const progress = state.userProgress.topics[state.currentTopic?.title] || { history: [] };
                const answeredQuestions = (progress.history || []).flatMap(h => h.questions.map(q => q.q));
                
                const utilsForQuiz = { showLoading, showToast, getFallbackQuestions, playSound };
                const quizResult = await quizControllerModule.runQuiz(null, state, dom, utilsForQuiz, answeredQuestions);
                
                if (quizResult.error) {
                    navigateTo(state.gameMode === 'topic' ? Screen.LEVEL : Screen.HOME);
                } else {
                    lastQuizData = quizResult.questions;
                    if (state.gameMode === 'topic') {
                        await recordQuizResult(state.currentTopic.title, state.currentLevel, quizResult.score, quizResult.questions);
                        if (quizResult.score >= SCORE_TO_UNLOCK_NEXT_LEVEL) {
                            await unlockNextLevel(state.currentTopic.title, state.currentLevel);
                        }
                    } else {
                        await recordQuizResult('Time Challenge', 1, quizResult.score, quizResult.questions);
                    }
                    
                    const newAchievements = await checkAndUnlockAchievements(quizResult.score, state.currentTopic?.title, state.currentLevel, state.gameMode);
                    newAchievements.forEach(ach => showToast(`Achievement Unlocked: ${ach.name}`, false, true));
                    
                    navigateTo(Screen.RESULTS, quizResult);
                }
                break;
            case Screen.RESULTS:
                renderResultsScreen(data, lastQuizData);
                break;
        }
    }

    async function init() {
        console.log("Initializing Dashboard...");
        state.user = checkAuth();
        
        await loadProgress();
        updateAuthUI(state.user);
        
        navigateTo(Screen.HOME);
        
        const is3DEnabled = localStorage.getItem('3dMode') !== 'false';
        set3DMode(is3DEnabled);
        
        initEventListeners(navigateTo, set3DMode, () => lastQuizData);
        initAudio();

        window.addEventListener('offline', () => dom.offlineBanner.classList.remove('hidden'));
        window.addEventListener('online', () => dom.offlineBanner.classList.add('hidden'));
        if (!navigator.onLine) dom.offlineBanner.classList.remove('hidden');
        
        // Prevent layout shift by showing main content only after setup
        dom.mainContent.style.visibility = 'visible';
        dom.mainContent.style.opacity = '1';
    }

    init();
});