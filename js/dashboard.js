
import sceneManager from './3d/sceneManager.js';
import { state, Screen } from './state.js';
import { dom } from './dom.js';
import { loadOrCreateLocalSession, loadProgress, recordQuizResult, unlockNextLevel } from './progress.js';
import { renderHomeScreen, renderLevelScreen, renderResultsScreen } from './ui.js';
import { showLoading, showToast, playSound, initAudio } from './utils.js';
import { initEventListeners } from './events.js';
import { getFallbackQuestions } from './questions-handler.js';

document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    
    let prefetchPromise = null;
    let quizControllerModule = null;

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

    async function navigateTo(screenId, data = {}) {
        if (state.currentScreen === Screen.QUIZ && quizControllerModule) {
            quizControllerModule.cleanupQuiz();
        }

        console.log(`Navigating to screen: ${screenId}`);
        state.currentScreen = screenId;
        dom.screens.forEach(s => s.classList.toggle('hidden', s.id !== screenId));
        
        updateBackground(screenId === Screen.LEVEL || screenId === Screen.QUIZ ? state.currentTopic?.id : null);
        
        switch (screenId) {
            case Screen.HOME: 
                renderHomeScreen(handleTopicSelection); 
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
                
                const utilsForQuiz = { playSound, showLoading, showToast, getFallbackQuestions };
                const quizResult = await quizControllerModule.runQuiz(prefetchPromise, state, dom, utilsForQuiz, answeredQuestions);
                prefetchPromise = null;
                
                if (quizResult.error) {
                    navigateTo(Screen.LEVEL);
                } else {
                    if (state.gameMode === 'topic') {
                        await recordQuizResult(state.currentTopic.title, state.currentLevel, quizResult.score, quizResult.questions);
                        if (quizResult.score >= 7) { // SCORE_TO_UNLOCK_NEXT_LEVEL
                            await unlockNextLevel(state.currentTopic.title, state.currentLevel);
                        }
                    }
                    navigateTo(Screen.RESULTS, quizResult);
                }
                break;
            case Screen.RESULTS: 
                renderResultsScreen(data); 
                break;
        }
    }

    async function init() {
        console.log("Initializing dashboard...");
        initAudio();
        
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
        
        loadOrCreateLocalSession();
        await loadProgress();
        
        initEventListeners(navigateTo);

        setInterval(() => { fetch('/api/ping').catch(() => {}); }, 4 * 60 * 1000);

        navigateTo(Screen.HOME);
    }

    init();
});
