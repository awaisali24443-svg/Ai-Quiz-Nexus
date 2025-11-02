import { dom } from './dom.js';
import { state, Screen } from './state.js';
import { loadProgress } from './progress.js';
import { showToast, playSound } from './utils.js';
import { renderHomeScreen, renderLevelScreen, renderReviewModal, renderProfileScreen } from './ui.js';

export function initEventListeners(navigateTo, set3DMode, getLastQuizData) {

    // --- Settings Menu ---
    dom.toggle3DBtn.addEventListener('click', () => {
        playSound('click');
        set3DMode(!state.is3DMode);
    });
    
    dom.resetProgressBtn.addEventListener('click', () => {
        playSound('click');
        dom.resetConfirmModal.classList.remove('hidden');
    });

    // --- Modals ---
    dom.cancelResetBtn.addEventListener('click', () => {
        playSound('click');
        dom.resetConfirmModal.classList.add('hidden');
    });
    
    dom.confirmResetBtn.addEventListener('click', async () => {
        playSound('click');
        const key = state.user.isGuest ? 'aiQuizProgress_guest' : `aiQuizProgress_${state.user.id}`;
        localStorage.removeItem(key);
        await loadProgress();
        
        // Re-render the current screen to reflect the change
        if (state.currentScreen === Screen.HOME) navigateTo(Screen.HOME);
        if (state.currentScreen === Screen.LEVEL) navigateTo(Screen.LEVEL);
        if (state.currentScreen === Screen.PROFILE) navigateTo(Screen.PROFILE);

        dom.resetConfirmModal.classList.add('hidden');
        showToast('Progress has been reset.');
    });
    
    dom.closeReviewModalBtn.addEventListener('click', () => {
        playSound('click');
        dom.reviewModal.classList.add('hidden');
    });

    // --- Navigation ---
    dom.mobileNavItems.forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('click');
            const targetScreen = btn.dataset.screen;
            if(targetScreen && state.currentScreen !== targetScreen) {
                navigateTo(targetScreen);
            }
        });
    });

    dom.logo.addEventListener('click', (e) => {
        e.preventDefault();
        playSound('click');
        if (state.currentScreen !== Screen.HOME) navigateTo(Screen.HOME);
    });

    // --- Global Click Handler for Dynamic Buttons ---
    document.addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;
        
        switch(btn.id) {
            case 'next-level-btn':
                playSound('click');
                state.currentLevel++;
                navigateTo(Screen.QUIZ);
                break;
            case 'retry-btn':
                playSound('click');
                navigateTo(Screen.QUIZ);
                break;
            case 'retry-challenge-btn':
                playSound('click');
                const challengeTopic = state.topics.find(t => t.isChallenge);
                if (challengeTopic) {
                    state.currentTopic = challengeTopic;
                    state.gameMode = 'timeChallenge';
                    navigateTo(Screen.QUIZ);
                }
                break;
            case 'topics-btn':
            case 'back-to-topics-btn':
                playSound('click');
                navigateTo(Screen.HOME);
                break;
            case 'start-current-level-btn':
                playSound('click');
                const p = state.userProgress.topics[state.currentTopic.title] || { highestLevelUnlocked: 1 };
                state.currentLevel = p.highestLevelUnlocked;
                navigateTo(Screen.QUIZ);
                break;
            case 'review-answers-btn':
                playSound('click');
                const lastQuiz = getLastQuizData();
                if (lastQuiz) {
                    renderReviewModal(lastQuiz);
                } else {
                    showToast("No quiz data to review.", true);
                }
                break;
        }
    });

    // --- Level Selection ---
    dom.levelGrid.addEventListener('click', (e) => {
        const levelBtn = e.target.closest('.level-btn.unlocked');
        if (levelBtn) {
            playSound('click');
            const level = parseInt(levelBtn.querySelector('.level-number').textContent);
            state.currentLevel = level;
            navigateTo(Screen.QUIZ);
        }
    });
}