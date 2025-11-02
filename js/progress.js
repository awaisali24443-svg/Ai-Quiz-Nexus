import { state, TOTAL_LEVELS } from './state.js';

function getStorageKey() {
    if (!state.user || !state.user.id) return null;
    if (state.user.isGuest) {
        return 'aiQuizProgress_guest';
    }
    return `aiQuizProgress_${state.user.id}`;
}

export async function saveProgress() {
    const storageKey = getStorageKey();
    if (!storageKey) return;
    
    console.log(`Saving progress for ${storageKey}...`);
    localStorage.setItem(storageKey, JSON.stringify(state.userProgress));
}

export async function loadProgress() {
    const storageKey = getStorageKey();
    if (!storageKey) {
        console.log("No user found, starting fresh progress.");
        state.userProgress = { topics: {} };
        return;
    }

    const saved = localStorage.getItem(storageKey);
    if (saved) {
        try {
            state.userProgress = JSON.parse(saved);
            console.log(`Progress loaded for ${storageKey}.`);
        } catch (e) {
            console.error("Could not parse user progress", e);
            state.userProgress = { topics: {} };
        }
    } else {
         state.userProgress = { topics: {} };
         console.log(`No saved progress found for ${storageKey}, starting fresh.`);
    }
}

export async function unlockNextLevel(topicTitle, completedLevel) {
    const p = state.userProgress.topics[topicTitle] || { highestLevelUnlocked: 1, history: [] };
    if (completedLevel === p.highestLevelUnlocked && completedLevel < TOTAL_LEVELS) {
        p.highestLevelUnlocked++;
        console.log(`Level ${p.highestLevelUnlocked} unlocked for topic ${topicTitle}.`);
    }
    state.userProgress.topics[topicTitle] = p;
    await saveProgress();
}

export async function recordQuizResult(topicTitle, level, score, questions) {
    const p = state.userProgress.topics[topicTitle] || { highestLevelUnlocked: 1, history: [] };
    p.history = p.history || [];
    p.history.push({ level, score, date: new Date().toISOString(), questions: questions.map(q => ({q: q.q, answer: q.answer})) });
    state.userProgress.topics[topicTitle] = p;
    console.log(`Result recorded for ${topicTitle} Level ${level}: Score ${score}`);
    await saveProgress();
}