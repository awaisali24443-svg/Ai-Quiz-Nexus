
import { dom } from './dom.js';
import { state, Screen } from './state.js';
import { saveProgress } from './progress.js';
import { showToast, playSound } from './utils.js';
import { logout } from './auth.js';

export function initEventListeners(navigateTo) {
    dom.resetProgressBtn.addEventListener('click', () => {
        playSound('click');
        if (confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
            localStorage.removeItem(`aiQuizProgress_${state.user.id}`);
            state.userProgress = { topics: {} };
            
            // Re-render the current screen to reflect the change
            if (state.currentScreen === Screen.HOME) navigateTo(Screen.HOME);
            if (state.currentScreen === Screen.LEVEL) navigateTo(Screen.LEVEL);

            showToast('Progress has been reset.');
        }
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        playSound('click');
        logout();
    });

    dom.mobileNavItems.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetScreen = btn.dataset.screen;
            if(targetScreen) navigateTo(targetScreen);
        });
    });

    // Global click handler for dynamically created buttons
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
                navigateTo(Screen.QUIZ, { isChallenge: true });
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
        }
    });

    dom.logo.addEventListener('click', (e) => {
        e.preventDefault();
        playSound('click');
        navigateTo(Screen.HOME);
    });
}