import { dom } from './dom.js';
import { state, Screen } from './state.js';
import { loadProgress } from './progress.js';
import { showToast, playSound } from './utils.js';
import { renderReviewModal } from './ui.js';

function handleModalClose(e) {
    if (e.target.closest('.modal-content')) return;
    const modal = e.target.closest('.modal-container');
    if (modal) {
        modal.classList.add('hidden');
    }
}

export function initEventListeners(navigateTo, set3DMode, getLastQuizData) {

    // --- Settings Menu ---
    dom.settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playSound('click');
        dom.settingsMenu.classList.toggle('open');
    });

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
        
        await navigateTo(Screen.HOME); // Navigate home to show fresh state.

        dom.resetConfirmModal.classList.add('hidden');
        showToast('Progress has been reset.');
    });
    
    dom.closeReviewModalBtn.addEventListener('click', () => {
        playSound('click');
        dom.reviewModal.classList.add('hidden');
    });

    // Add event listener to modal containers to close on backdrop click
    dom.resetConfirmModal.addEventListener('click', handleModalClose);
    dom.reviewModal.addEventListener('click', handleModalClose);

    // --- Navigation ---
    dom.mobileNavItems.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetScreen = btn.dataset.screen;
            if(targetScreen) {
                playSound('click');
                navigateTo(targetScreen);
            }
        });
    });

    dom.logo.addEventListener('click', (e) => {
        e.preventDefault();
        playSound('click');
        navigateTo(Screen.HOME);
    });
    
    dom.backToTopicsBtn.addEventListener('click', () => {
        playSound('click');
        navigateTo(Screen.HOME);
    });
    
    dom.startCurrentLevelBtn.addEventListener('click', () => {
        playSound('click');
        const p = state.userProgress.topics[state.currentTopic.title] || { highestLevelUnlocked: 1 };
        state.currentLevel = p.highestLevelUnlocked;
        navigateTo(Screen.QUIZ);
    });

    // --- Global Click Handler for Dynamic Buttons & Closing Menus ---
    document.addEventListener('click', e => {
        // --- Close Settings Menu ---
        if (dom.settingsMenu.classList.contains('open') && !e.target.closest('.settings-container')) {
            dom.settingsMenu.classList.remove('open');
        }
        
        // --- Button Actions on Results Screen (dynamically added) ---
        const btn = e.target.closest('button');
        if (!btn || !btn.id) return;
        
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
                playSound('click');
                navigateTo(Screen.HOME);
                break;
            case 'review-answers-btn':
                playSound('click');
                const lastQuiz = getLastQuizData();
                if (lastQuiz) {
                    renderReviewModal(lastQuiz);
                } else {
                    showToast("No quiz data available to review.", true);
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