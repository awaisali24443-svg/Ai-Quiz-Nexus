import sceneManager from './3d/sceneManager.js';
import { state, Screen, SCORE_TO_UNLOCK_NEXT_LEVEL } from './state.js';
import { dom, initializeDom } from './dom.js';
import { loadProgress, recordQuizResult, unlockNextLevel, checkAndUnlockAchievements } from './progress.js';
import { renderHomeScreen, renderLevelScreen, renderResultsScreen, renderProfileScreen } from './ui.js';
import { showLoading, showToast, initAudio, playSound } from './utils.js';
import { initEventListeners } from './events.js';
import { getFallbackQuestions } from './questions-handler.js';
import { checkAuth, logout } from './auth.js';

class DashboardApp {
    constructor() {
        this.quizControllerModule = null;
        this.lastQuizData = null;
        this.isInitialized = false;

        document.addEventListener('DOMContentLoaded', this.init.bind(this));
    }

    async init() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        try {
            console.log("Initializing Dashboard...");
            initializeDom();

            state.user = checkAuth();
            
            await loadProgress();
            this.updateAuthUI();
            
            this.setupGlobalEventListeners();
            initEventListeners(
                this.navigateTo.bind(this),
                this.set3DMode.bind(this),
                () => this.lastQuizData
            );
            initAudio();

            await this.navigateTo(Screen.HOME);
            
            const is3DEnabled = localStorage.getItem('3dMode') !== 'false';
            this.set3DMode(is3DEnabled);
        
        } catch (error) {
            console.error("Critical error during dashboard initialization:", error);
            document.body.innerHTML = `<div style="position: fixed; inset: 0; color: white; background-color: #0a0a1f; padding: 40px; text-align: center; z-index: 9999;"><h1>An Unexpected Error Occurred</h1><p>The quiz dashboard could not be loaded. Please try refreshing the page.</p><p style="color: #666; font-size: 14px; margin-top: 20px;">Error: ${error.message}</p></div>`;
        } finally {
            if (dom.mainContent) {
                dom.mainContent.style.visibility = 'visible';
                dom.mainContent.style.opacity = '1';
            }
        }
    }

    setupGlobalEventListeners() {
        window.addEventListener('offline', () => dom.offlineBanner.classList.remove('hidden'));
        window.addEventListener('online', () => dom.offlineBanner.classList.add('hidden'));
        if (!navigator.onLine) dom.offlineBanner.classList.remove('hidden');
    }

    updateAuthUI() {
        const user = state.user;
        const usernameDisplay = document.getElementById('username-display');
        const authActionButton = document.getElementById('auth-action-btn');
        const profileNavBtn = document.querySelector('.nav-item[data-screen="profile-screen"]');
        const settingsContainer = document.querySelector('.settings-container');

        if (user.isGuest) {
            dom.guestBanner.classList.remove('hidden');
            usernameDisplay.textContent = 'Guest';
            authActionButton.textContent = 'Login';
            authActionButton.onclick = () => { window.location.href = '/login.html'; };
            if (profileNavBtn) profileNavBtn.classList.add('hidden');
            if (settingsContainer) settingsContainer.classList.add('hidden');
        } else {
            dom.guestBanner.classList.add('hidden');
            usernameDisplay.textContent = user.username;
            authActionButton.textContent = 'Logout';
            authActionButton.onclick = () => logout();
            if (profileNavBtn) profileNavBtn.classList.remove('hidden');
            if (settingsContainer) settingsContainer.classList.remove('hidden');
        }
        this.adjustLayoutForBanners();
    }

    adjustLayoutForBanners() {
        const guestBannerHeight = dom.guestBanner.classList.contains('hidden') ? 0 : (dom.guestBanner.offsetHeight || 50);
        dom.appHeader.style.top = `${guestBannerHeight}px`;
        dom.mainContent.style.paddingTop = `${100 + guestBannerHeight}px`;
    }

    async updateBackground(topicId = null) {
        const sceneToLoad = (topicId === 'default' || !topicId) ? 'world_knowledge' : topicId;
        if (state.is3DMode && sceneManager.isWebGLAvailable()) {
            document.body.classList.add('mode-3d');
            await sceneManager.init(sceneToLoad, dom.webGLContainer);
        } else {
            document.body.classList.remove('mode-3d');
            sceneManager.destroy();
        }
    }

    set3DMode(enabled) {
        state.is3DMode = enabled;
        localStorage.setItem('3dMode', String(enabled));
        const toggleBtn = document.getElementById('toggle-3d-btn');
        if(toggleBtn) {
            toggleBtn.querySelector('span').textContent = enabled ? '3D Background' : '2D Background';
            toggleBtn.classList.toggle('active', enabled);
        }
        showLoading(true, "Switching visuals...");
        const currentBg = (state.currentScreen === Screen.LEVEL || state.currentScreen === Screen.QUIZ) ? state.currentTopic?.id : 'default';
        this.updateBackground(currentBg).finally(() => showLoading(false));
    }

    handleTopicSelection(topic) {
        playSound('click');
        state.currentTopic = topic;

        if (topic.isChallenge) {
            state.gameMode = 'timeChallenge';
            this.navigateTo(Screen.QUIZ);
        } else {
            state.gameMode = 'topic';
            const progress = state.userProgress.topics[topic.title] || { highestLevelUnlocked: 1 };
            state.currentLevel = progress.highestLevelUnlocked;
            this.navigateTo(Screen.LEVEL);
        }
    }

    async navigateTo(screenId, data = {}) {
        if (state.currentScreen === screenId) return;

        if (state.currentScreen === Screen.QUIZ && this.quizControllerModule) {
            this.quizControllerModule.cleanupQuiz();
        }

        console.log(`Navigating to screen: ${screenId}`);
        state.currentScreen = screenId;
        showLoading(true, "Loading...");
        
        try {
            const backgroundTopicId = (screenId === Screen.LEVEL || screenId === Screen.QUIZ) && state.currentTopic ? state.currentTopic.id : 'default';
            dom.appContainer.className = `bg-${backgroundTopicId}`;
            await this.updateBackground(backgroundTopicId);

            dom.screens.forEach(s => s.classList.toggle('hidden', s.id !== screenId));
            dom.mobileNavItems.forEach(item => {
                item.classList.toggle('active', item.dataset.screen === screenId);
            });
            
            switch (screenId) {
                case Screen.HOME: 
                    renderHomeScreen(this.handleTopicSelection.bind(this)); 
                    break;
                case Screen.PROFILE:
                    if (state.user.isGuest) { await this.navigateTo(Screen.HOME); return; }
                    await renderProfileScreen();
                    break;
                case Screen.LEVEL: 
                    renderLevelScreen(); 
                    break;
                case Screen.QUIZ:
                    await this.startQuiz();
                    return; // startQuiz handles its own navigation flow
                case Screen.RESULTS:
                    renderResultsScreen(data, this.lastQuizData);
                    break;
            }
        } finally {
            showLoading(false);
        }
    }

    async startQuiz() {
        if (!this.quizControllerModule) {
            showLoading(true, "Loading quiz engine...");
            this.quizControllerModule = await import('./quiz_controller.js');
        }
        
        const progress = state.userProgress.topics[state.currentTopic?.title] || { history: [] };
        const answeredQuestions = (progress.history || []).flatMap(h => h.questions.map(q => q.q));
        
        const quizResult = await this.quizControllerModule.runQuiz(
            state,
            dom,
            { showLoading, showToast, getFallbackQuestions, playSound },
            answeredQuestions
        );
        
        showLoading(false); // Ensure loading is hidden after quiz ends

        if (quizResult.error) {
            this.navigateTo(state.gameMode === 'topic' ? Screen.LEVEL : Screen.HOME);
        } else {
            this.lastQuizData = quizResult.questions;
            await this.processQuizResults(quizResult);
            const newAchievements = await checkAndUnlockAchievements(quizResult.score, state.currentTopic?.title, state.currentLevel, state.gameMode);
            newAchievements.forEach(ach => showToast(`Achievement Unlocked: ${ach.name}`, false, true));
            
            this.navigateTo(Screen.RESULTS, quizResult);
        }
    }

    async processQuizResults(quizResult) {
        if (state.gameMode === 'topic') {
            await recordQuizResult(state.currentTopic.title, state.currentLevel, quizResult.score, quizResult.questions);
            if (quizResult.score >= SCORE_TO_UNLOCK_NEXT_LEVEL) {
                await unlockNextLevel(state.currentTopic.title, state.currentLevel);
            }
        } else {
            // For time challenge, topic is 'Time Challenge' and level is always 1
            await recordQuizResult('Time Challenge', 1, quizResult.score, quizResult.questions);
        }
    }
}

new DashboardApp();
