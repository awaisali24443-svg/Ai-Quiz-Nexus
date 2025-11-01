
import { dom } from './dom.js';
import { state, TOPICS, TOTAL_LEVELS, SCORE_TO_UNLOCK_NEXT_LEVEL } from './state.js';

export function renderHomeScreen(onTopicSelect) {
    console.log("Rendering home screen...");
    dom.topicGrid.innerHTML = '';

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    TOPICS.forEach((topic, index) => {
        const card = document.createElement('div');
        card.className = 'topic-card';
        card.dataset.topicId = topic.id;
        card.style.transitionDelay = `${index * 50}ms`;
        card.innerHTML = `
            <div class="topic-card-content">
                <h3>${topic.title}</h3>
                <p>${topic.description}</p>
            </div>`;
        card.addEventListener('click', () => onTopicSelect(topic));
        dom.topicGrid.appendChild(card);
        observer.observe(card);
    });
}

export function renderLevelScreen() {
    if (!state.currentTopic) return;
    
    console.log(`Rendering level screen for ${state.currentTopic.title}`);
    const { title } = state.currentTopic;
    const progress = state.userProgress.topics[title] || { highestLevelUnlocked: 1, history: [] };
    
    dom.levelGrid.innerHTML = '';
    dom.levelTopicTitle.textContent = title;
    dom.levelProgressBar.style.width = `${(progress.highestLevelUnlocked - 1) / TOTAL_LEVELS * 100}%`;
    dom.levelProgressText.textContent = `You have unlocked level ${progress.highestLevelUnlocked} of ${TOTAL_LEVELS}.`;
    dom.currentLevelText.textContent = progress.highestLevelUnlocked;

    for (let i = 1; i <= TOTAL_LEVELS; i++) {
        const btn = document.createElement('button');
        btn.className = 'level-btn';
        btn.innerHTML = `<div class="level-number">${i}</div>`;
        if (i < progress.highestLevelUnlocked) {
            btn.classList.add('completed');
            btn.innerHTML += `<div class="level-status">Done</div>`;
        } else if (i === progress.highestLevelUnlocked) {
            btn.classList.add('unlocked');
            btn.innerHTML += `<div class="level-status">Next</div>`;
            // The main `start-current-level-btn` is used instead of individual level buttons now.
        } else {
            btn.classList.add('locked');
            btn.disabled = true;
        }
        dom.levelGrid.appendChild(btn);
    }

    dom.historyLog.innerHTML = '';
    if (progress.history && progress.history.length > 0) {
        const reversedHistory = [...progress.history].reverse().slice(0, 10);
        reversedHistory.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="history-item-details"><span class="level-tag">Lvl ${item.level}</span> ${new Date(item.date).toLocaleDateString()}</div>
                <div class="history-item-score">${item.score} / 10</div>`;
            dom.historyLog.appendChild(div);
        });
    } else {
        dom.historyLog.innerHTML = `<p class="no-history-message">No attempts recorded for this topic yet.</p>`;
    }
}

export function renderResultsScreen({ score, timedOut }) {
    console.log("Rendering results screen.");
    dom.finalScoreValue.textContent = score;
    dom.correctAnswers.textContent = score;
    dom.incorrectAnswers.textContent = 10 - score;
    dom.resultsTopicText.textContent = state.gameMode === 'topic' ? `${state.currentTopic.title} - Level ${state.currentLevel}` : 'Time Challenge';
    
    dom.unlockMessage.classList.add('hidden');

    if (state.gameMode === 'topic') {
        const canAdvance = score >= SCORE_TO_UNLOCK_NEXT_LEVEL && state.currentLevel < TOTAL_LEVELS;
        if (canAdvance) {
            dom.unlockMessage.textContent = `🎉 You've unlocked Level ${state.currentLevel + 1}!`;
            dom.unlockMessage.classList.remove('hidden');
        }
        dom.resultsActionButtons.innerHTML = `
            ${canAdvance ? '<button id="next-level-btn" class="btn btn-primary">Next Level</button>' : ''}
            <button id="retry-btn" class="btn btn-secondary">Retry Level</button>
            <button id="topics-btn" class="btn btn-secondary">Back to Topics</button>`;
    } else {
        dom.resultsActionButtons.innerHTML = `
            <button id="retry-challenge-btn" class="btn btn-primary">Try Again</button>
            <button id="topics-btn" class="btn btn-secondary">Back to Topics</button>`;
    }
}
