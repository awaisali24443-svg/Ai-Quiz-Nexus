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
        this.lastQuizData = null; // Stores questions from the last quiz for review
        this.isInitialized = false;

        document.addEventListener('DOMContentLoaded', this.init.bind(this));
    }

    /**
     * Initializes the entire application.
     */
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
            
            // Restore user's 3D mode preference
            const is3DEnabled = localStorage.getItem('3dMode') !== 'false';
            this.set3DMode(is3DEnabled);
        
        } catch (error) {
            console.error("Critical error during dashboard initialization:", error);
            document.body.innerHTML = `<div style="position: fixed; inset: 0; color: white; background-color: #0a0a1f; padding: 40px; text-align: center; z-index: 9999;"><h1>An Unexpected Error Occurred</h1><p>The quiz dashboard could not be loaded. Please try refreshing the page.</p><p style="color: #666; font-size: 14px; margin-top: 20px;">Error: ${error.message}</p></div>`;
        } finally {
            // Fade in the main content once everything is ready
            if (dom.mainContent) {
                dom.mainContent.style.visibility = 'visible';
                dom.mainContent.style.opacity = '1';
            }
        }
    }

    /**
     * Sets up global listeners for offline/online status.
     */
    setupGlobalEventListeners() {
        const handleOnlineStatus = () => {
            dom.offlineBanner.classList.toggle('hidden', navigator.onLine);
            this.adjustLayoutForBanners();
        };
        window.addEventListener('offline', handleOnlineStatus);
        window.addEventListener('online', handleOnlineStatus);
        handleOnlineStatus(); // Set initial state
    }

    /**
     * Updates header UI based on whether the user is a guest or logged in.
     */
    updateAuthUI() {
        const { user } = state;
        const profileNavBtn = document.querySelector('.nav-item[data-screen="profile-screen"]');

        if (user.isGuest) {
            dom.guestBanner.classList.remove('hidden');
            dom.usernameDisplay.textContent = 'Guest';
            dom.authActionBtn.textContent = 'Login';
            dom.authActionBtn.onclick = () => { window.location.href = '/login.html'; };
            if (profileNavBtn) profileNavBtn.classList.add('hidden');
            dom.settingsContainer.classList.add('hidden');
        } else {
            dom.guestBanner.classList.add('hidden');
            dom.usernameDisplay.textContent = user.username;
            dom.authActionBtn.textContent = 'Logout';
            dom.authActionBtn.onclick = () => logout();
            if (profileNavBtn) profileNavBtn.classList.remove('hidden');
            dom.settingsContainer.classList.remove('hidden');
        }
        this.adjustLayoutForBanners();
    }

    /**
     * Adjusts layout paddings to account for visible banners (Guest/Offline).
     */
    adjustLayoutForBanners() {
        const guestBannerHeight = dom.guestBanner.classList.contains('hidden') ? 0 : (dom.guestBanner.offsetHeight || 50);
        const offlineBannerHeight = dom.offlineBanner.classList.contains('hidden') ? 0 : (dom.offlineBanner.offsetHeight || 50);
        const totalBannerHeight = guestBannerHeight + offlineBannerHeight;
        dom.appHeader.style.top = `${totalBannerHeight}px`;
        dom.mainContent.style.paddingTop = `${100 + totalBannerHeight}px`;
    }

    /**
     * Toggles 3D background mode on or off.
     * @param {boolean} enabled - Whether to enable 3D mode.
     */
    async set3DMode(enabled) {
        state.is3DMode = enabled;
        localStorage.setItem('3dMode', String(enabled));
        dom.toggle3DBtn.querySelector('span').textContent = enabled ? '3D Background' : '2D Background';
        dom.toggle3DBtn.classList.toggle('active', enabled);
        
        showLoading(true, "Switching visuals...");
        const currentTopicId = (state.currentScreen === Screen.LEVEL || state.currentScreen === Screen.QUIZ) 
            ? state.currentTopic?.id 
            : 'default';
        await this.updateBackground(currentTopicId);
        showLoading(false);
    }

    /**
     * Manages the background, switching between 2D and 3D scenes.
     * @param {string|null} topicId - The topic ID to determine which scene to load.
     */
    async updateBackground(topicId = null) {
        const sceneToLoad = (topicId === 'default' || !topicId) ? 'world_knowledge' : topicId;
        
        // Update 2D background class first for a fast fallback
        dom.appContainer.className = `bg-${sceneToLoad}`;

        if (state.is3DMode && sceneManager.isWebGLAvailable()) {
            document.body.classList.add('mode-3d');
            await sceneManager.init(sceneToLoad, dom.webGLContainer);
        } else {
            document.body.classList.remove('mode-3d');
            sceneManager.destroy(); // Ensure any existing scene is destroyed
        }
    }

    /**
     * Handles user selecting a topic from the home screen.
     * @param {object} topic - The selected topic object.
     */
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

    /**
     * Main navigation logic to switch between application screens.
     * @param {string} screenId - The ID of the screen to navigate to.
     * @param {object} [data={}] - Optional data to pass to the new screen.
     */
    async navigateTo(screenId, data = {}) {
        if (state.isNavigating) return; // Prevent concurrent navigation
        state.isNavigating = true;
        
        // If leaving the quiz screen, ensure its resources are cleaned up.
        if (state.currentScreen === Screen.QUIZ && this.quizControllerModule) {
            this.quizControllerModule.cleanupQuiz();
        }

        console.log(`Navigating to screen: ${screenId}`);
        state.currentScreen = screenId;
        showLoading(true, "Loading...");

        try {
            const backgroundTopicId = (screenId === Screen.LEVEL || screenId === Screen.QUIZ) && state.currentTopic 
                ? state.currentTopic.id 
                : 'default';
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
                    await this.runQuizSequence();
                    return; // Quiz sequence handles its own final navigation
                case Screen.RESULTS:
                    renderResultsScreen(data, this.lastQuizData);
                    break;
            }
        } catch (error) {
            console.error(`Navigation to ${screenId} failed:`, error);
            showToast("An error occurred. Returning to home.", true);
            await this.navigateTo(Screen.HOME); // Fallback to home screen on error
        } finally {
            showLoading(false);
            state.isNavigating = false;
        }
    }
    
    /**
     * Encapsulates the entire quiz flow, from loading to processing results.
     */
    async runQuizSequence() {
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
            // If quiz fails to start, navigate back to the appropriate screen
            this.navigateTo(state.gameMode === 'topic' ? Screen.LEVEL : Screen.HOME);
        } else {
            this.lastQuizData = quizResult.questions;
            await this.processQuizResults(quizResult);

            const newAchievements = await checkAndUnlockAchievements(quizResult.score, state.currentTopic?.title, state.currentLevel, state.gameMode);
            newAchievements.forEach(ach => showToast(`Achievement Unlocked: ${ach.name}`, false, true));
            
            this.navigateTo(Screen.RESULTS, quizResult);
        }
    }

    /**
     * Processes and saves the results of a completed quiz.
     * @param {object} quizResult - The result object from the quiz controller.
     */
    async processQuizResults(quizResult) {
        if (state.gameMode === 'topic') {
            await recordQuizResult(state.currentTopic.title, state.currentLevel, quizResult.score, quizResult.questions);
            if (quizResult.score >= SCORE_TO_UNLOCK_NEXT_LEVEL) {
                await unlockNextLevel(state.currentTopic.title, state.currentLevel);
            }
        } else { // 'timeChallenge'
            await recordQuizResult('Time Challenge', 1, quizResult.score, quizResult.questions);
        }
    }
}

// Check if we are on the dashboard page before initializing
if (document.getElementById('app-container')) {
    new DashboardApp();
}