import { dom } from './dom.js';
import { state, Screen } from './state.js';
import { loadProgress } from './progress.js';
import { showToast, playSound } from './utils.js';
import { renderReviewModal } from './ui.js';

/**
 * Handles closing modals when the backdrop is clicked.
 * @param {Event} e - The click event.
 */
function handleModalClose(e) {
    // Closes the modal only if the click is on the container backdrop, not the content inside.
    if (e.target === e.currentTarget) {
        e.currentTarget.classList.add('hidden');
    }
}

/**
 * Initializes all primary event listeners for the application.
 * @param {function} navigateTo - The main navigation function from the dashboard controller.
 * @param {function} set3DMode - Function to toggle 3D mode.
 * @param {function} getLastQuizData - Function to retrieve the last quiz's data for review.
 */
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
        
        await loadProgress(); // Reload state to reflect the reset
        await navigateTo(Screen.HOME); // Navigate home to show the fresh state

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

    // --- Static Navigation Buttons ---
    dom.mobileNavItems.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetScreen = btn.dataset.screen;
            if (targetScreen) {
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
        const progress = state.userProgress.topics[state.currentTopic.title] || { highestLevelUnlocked: 1 };
        state.currentLevel = progress.highestLevelUnlocked;
        navigateTo(Screen.QUIZ);
    });

    // --- Level Selection Grid ---
    dom.levelGrid.addEventListener('click', (e) => {
        const levelBtn = e.target.closest('.level-btn.unlocked');
        if (levelBtn) {
            playSound('click');
            const level = parseInt(levelBtn.querySelector('.level-number').textContent, 10);
            state.currentLevel = level;
            navigateTo(Screen.QUIZ);
        }
    });

    // --- Global Click Handler for dynamic buttons and closing menus ---
    const dynamicActions = {
        'next-level-btn': () => {
            state.currentLevel++;
            navigateTo(Screen.QUIZ);
        },
        'retry-btn': () => navigateTo(Screen.QUIZ),
        'retry-challenge-btn': () => {
            const challengeTopic = state.topics.find(t => t.isChallenge);
            if (challengeTopic) {
                state.currentTopic = challengeTopic;
                state.gameMode = 'timeChallenge';
                navigateTo(Screen.QUIZ);
            }
        },
        'topics-btn': () => navigateTo(Screen.HOME),
        'review-answers-btn': () => {
            const lastQuiz = getLastQuizData();
            if (lastQuiz) {
                renderReviewModal(lastQuiz);
            } else {
                showToast("No quiz data available to review.", true);
            }
        }
    };

    document.addEventListener('click', e => {
        // --- Close Settings Menu on outside click ---
        if (dom.settingsMenu.classList.contains('open') && !e.target.closest('.settings-container')) {
            dom.settingsMenu.classList.remove('open');
        }
        
        // --- Handle dynamically created buttons ---
        const btn = e.target.closest('button');
        if (btn && dynamicActions[btn.id]) {
            playSound('click');
            dynamicActions[btn.id]();
        }
    });
}