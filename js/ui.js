

import { dom } from './dom.js';
import { state, TOPICS, TOTAL_LEVELS, SCORE_TO_UNLOCK_NEXT_LEVEL } from './state.js';
import { ACHIEVEMENTS } from './progress.js';
// Chart.js is dynamically imported to avoid loading it if the user never visits the profile.

let scoreChartInstance = null;

function createFeaturedCard(topic, onTopicSelect) {
    const card = document.createElement('div');
    card.className = 'time-challenge-card';
    card.innerHTML = `
        <h3>${topic.title}</h3>
        <p>${topic.description}</p>
        <button class="btn btn-primary btn-large">Start Challenge</button>
    `;
    card.addEventListener('click', () => onTopicSelect(topic));
    dom.timeChallengeContainer.appendChild(card);
}


export function renderHomeScreen(onTopicSelect) {
    dom.topicGrid.innerHTML = '';
    dom.timeChallengeContainer.innerHTML = '';

    const normalTopics = TOPICS.filter(t => !t.isChallenge);
    const challengeTopic = TOPICS.find(t => t.isChallenge);

    if (challengeTopic) {
        createFeaturedCard(challengeTopic, onTopicSelect);
    }
    
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    normalTopics.forEach((topic, index) => {
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
        } else {
            btn.classList.add('locked');
            btn.disabled = true;
        }
        dom.levelGrid.appendChild(btn);
    }
}

export function renderResultsScreen({ score, timedOut }, questions) {
    dom.finalScoreValue.textContent = score;
    dom.totalQuestionsValue.textContent = questions.length;
    dom.correctAnswers.textContent = score;
    dom.incorrectAnswers.textContent = questions.length - score;
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
            <button id="review-answers-btn" class="btn btn-secondary">Review Answers</button>
            <button id="topics-btn" class="btn btn-secondary">Back to Topics</button>`;
    } else {
        dom.resultsActionButtons.innerHTML = `
            <button id="retry-challenge-btn" class="btn btn-primary">Try Again</button>
            <button id="review-answers-btn" class="btn btn-secondary">Review Answers</button>
            <button id="topics-btn" class="btn btn-secondary">Back to Topics</button>`;
    }
}

export async function renderProfileScreen() {
    if (state.user.isGuest) return;

    const { stats, topics, achievements } = state.userProgress;

    // Stats Cards
    dom.statTotalQuizzes.textContent = stats.totalQuizzes || 0;

    const allHistory = Object.values(topics).flatMap(t => t.history || []);
    if (allHistory.length > 0) {
        const totalScore = allHistory.reduce((sum, item) => sum + item.score, 0);
        const avgScore = (totalScore / (allHistory.length * 10)) * 100;
        dom.statAvgScore.textContent = `${Math.round(avgScore)}%`;

        const topicScores = {};
        Object.entries(topics).forEach(([title, data]) => {
            if (data.history && data.history.length > 0) {
                const total = data.history.reduce((s, i) => s + i.score, 0);
                topicScores[title] = total / data.history.length;
            }
        });
        const bestTopic = Object.keys(topicScores).reduce((a, b) => topicScores[a] > topicScores[b] ? a : b, '-');
        dom.statBestTopic.textContent = bestTopic;
    } else {
        dom.statAvgScore.textContent = '0%';
        dom.statBestTopic.textContent = '-';
    }

    // Achievements Grid
    dom.achievementsGrid.innerHTML = '';
    Object.entries(ACHIEVEMENTS).forEach(([id, ach]) => {
        const isUnlocked = achievements[id]?.unlocked;
        const card = document.createElement('div');
        card.className = `achievement-card ${isUnlocked ? 'unlocked' : ''}`;
        card.innerHTML = `
            <div class="achievement-icon">${isUnlocked ? '🏆' : '🔒'}</div>
            <div class="achievement-details">
                <h4>${ach.name}</h4>
                <p>${ach.description}</p>
            </div>`;
        dom.achievementsGrid.appendChild(card);
    });

    // Score Chart
    const recentScores = allHistory.slice(-10).map(item => item.score);
    const chartLabels = recentScores.map((_, i) => `Quiz ${i + 1}`);

    if (scoreChartInstance) {
        scoreChartInstance.destroy();
    }
    const { default: Chart } = await import('https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.js');
    scoreChartInstance = new Chart(dom.scoreChartCanvas, {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Score',
                data: recentScores,
                backgroundColor: 'rgba(0, 234, 255, 0.5)',
                borderColor: 'rgba(0, 234, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 10, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.1)' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}


export function renderReviewModal(questions) {
    dom.reviewContent.innerHTML = '';
    questions.forEach((q, index) => {
        const item = document.createElement('div');
        item.className = 'review-item';
        let optionsHtml = '<ul class="review-options">';
        q.options.forEach(opt => {
            let className = '';
            if (opt === q.yourAnswer) className += ' user-choice';
            if (opt === q.answer) className += ' correct';
            else if (opt === q.yourAnswer) className += ' incorrect-user-choice';
            
            optionsHtml += `<li class="${className.trim()}">${opt}</li>`;
        });
        optionsHtml += '</ul>';

        let explanationHtml = '';
        if (q.explanation) {
            explanationHtml = `<div class="review-explanation">
                <p><strong>💡 Explanation:</strong> ${q.explanation}</p>
            </div>`;
        }

        item.innerHTML = `<p>${index + 1}. ${q.q}</p>${optionsHtml}${explanationHtml}`;
        dom.reviewContent.appendChild(item);
    });
    dom.reviewModal.classList.remove('hidden');
}