
import { state, TOTAL_LEVELS } from './state.js';

export const ACHIEVEMENTS = {
    firstSteps: { name: "First Steps", description: "Complete your first quiz." },
    perfectScore: { name: "Perfectionist", description: "Get a perfect score (10/10) on any quiz." },
    topicMaster: { name: "Topic Master", description: "Unlock level 30 in any topic." },
    fiveQuizzes: { name: "Quiz Novice", description: "Complete 5 quizzes in total." },
    twentyFiveQuizzes: { name: "Quiz Adept", description: "Complete 25 quizzes in total." },
    fiftyQuizzes: { name: "Quiz Veteran", description: "Complete 50 quizzes in total." },
    timeTraveler: { name: "Time Traveler", description: "Complete a Time Challenge quiz." },
};

function getStorageKey() {
    if (!state.user || !state.user.id) return null;
    return state.user.isGuest ? 'aiQuizProgress_guest' : `aiQuizProgress_${state.user.id}`;
}

export async function saveProgress() {
    const storageKey = getStorageKey();
    if (!storageKey) return;
    
    console.log(`Saving progress for ${storageKey}...`);
    localStorage.setItem(storageKey, JSON.stringify(state.userProgress));
}

export async function loadProgress() {
    const storageKey = getStorageKey();
    const defaultProgress = { topics: {}, stats: { totalQuizzes: 0 }, achievements: {} };
    if (!storageKey) {
        state.userProgress = defaultProgress;
        return;
    }

    const saved = localStorage.getItem(storageKey);
    if (saved) {
        try {
            state.userProgress = JSON.parse(saved);
            // Ensure new data structures exist for older save files
            if (!state.userProgress.stats) state.userProgress.stats = { totalQuizzes: 0 };
            if (!state.userProgress.achievements) state.userProgress.achievements = {};
        } catch (e) {
            console.error("Could not parse user progress, resetting.", e);
            state.userProgress = defaultProgress;
        }
    } else {
         state.userProgress = defaultProgress;
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
    // Only store essential question data to keep localStorage size down
    p.history.push({ 
        level, 
        score, 
        date: new Date().toISOString(), 
        questions: questions.map(q => ({
            q: q.q, 
            answer: q.answer,
            options: q.options,
            yourAnswer: q.yourAnswer, // Assumes this is set in quiz_controller
            explanation: q.explanation // Add the explanation
        })) 
    });

    // Keep history from getting too large
    if (p.history.length > 50) p.history.shift();

    state.userProgress.topics[topicTitle] = p;

    // Update stats
    state.userProgress.stats = state.userProgress.stats || { totalQuizzes: 0 };
    state.userProgress.stats.totalQuizzes++;
    
    console.log(`Result recorded for ${topicTitle} Level ${level}: Score ${score}`);
    await saveProgress();
}

export async function checkAndUnlockAchievements(score, topicTitle, level, gameMode) {
    if (state.user.isGuest) return [];

    const newAchievements = [];
    const { achievements, stats, topics } = state.userProgress;

    const unlock = (id) => {
        if (!achievements[id]) {
            achievements[id] = { unlocked: true, date: new Date().toISOString() };
            newAchievements.push(ACHIEVEMENTS[id]);
        }
    };

    unlock('firstSteps');

    if (score === 10) {
        unlock('perfectScore');
    }

    const topicProgress = topics[topicTitle];
    if (topicProgress && topicProgress.highestLevelUnlocked > TOTAL_LEVELS) {
        unlock('topicMaster');
    }
    
    if (stats.totalQuizzes >= 50) unlock('fiftyQuizzes');
    else if (stats.totalQuizzes >= 25) unlock('twentyFiveQuizzes');
    else if (stats.totalQuizzes >= 5) unlock('fiveQuizzes');

    if (gameMode === 'timeChallenge') {
        unlock('timeTraveler');
    }

    if (newAchievements.length > 0) {
        await saveProgress();
    }
    return newAchievements;
}
