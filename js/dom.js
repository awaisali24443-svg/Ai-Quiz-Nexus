// The dom object is exported as a reference.
// It will be populated once the DOM is fully loaded and parsed.
export const dom = {};

export function initializeDom() {
    Object.assign(dom, {
        appContainer: document.getElementById('app-container'),
        screens: document.querySelectorAll('.screen'),
        loadingOverlay: document.getElementById('loading-overlay'),
        loadingText: document.getElementById('loading-text'),
        toastContainer: document.getElementById('toast-container'),
        mainContent: document.querySelector('main'),
        webGLContainer: document.getElementById('webgl-container'),
        logo: document.querySelector('.logo'),
        mobileNavItems: document.querySelectorAll('.mobile-nav .nav-item'),
        appHeader: document.getElementById('app-header'),
        guestBanner: document.getElementById('guest-banner'),
        offlineBanner: document.getElementById('offline-banner'),
        
        // Header & Settings
        settingsBtn: document.getElementById('settings-btn'),
        settingsMenu: document.querySelector('.settings-menu'),
        toggle3DBtn: document.getElementById('toggle-3d-btn'),
        resetProgressBtn: document.getElementById('reset-progress-btn'),
        usernameDisplay: document.getElementById('username-display'),
        authActionBtn: document.getElementById('auth-action-btn'),
        settingsContainer: document.querySelector('.settings-container'),


        // Home Screen
        timeChallengeContainer: document.getElementById('time-challenge-container'),
        topicGrid: document.getElementById('topic-grid'),

        // Profile Screen
        statTotalQuizzes: document.getElementById('stat-total-quizzes'),
        statAvgScore: document.getElementById('stat-avg-score'),
        statBestTopic: document.getElementById('stat-best-topic'),
        scoreChartCanvas: document.getElementById('score-chart'),
        achievementsGrid: document.getElementById('achievements-grid'),

        // Level Screen
        levelGrid: document.getElementById('level-grid'),
        levelTopicTitle: document.getElementById('level-topic-title'),
        levelProgressBar: document.getElementById('level-progress-bar'),
        levelProgressText: document.getElementById('level-progress-text'),
        currentLevelText: document.getElementById('current-level-text'),
        startCurrentLevelBtn: document.getElementById('start-current-level-btn'),
        backToTopicsBtn: document.getElementById('back-to-topics-btn'),

        // Quiz Screen
        quizTimer: document.getElementById('quiz-timer'),
        questionCounter: document.getElementById('question-counter'),
        quizProgressBar: document.getElementById('quiz-progress-bar'),
        questionText: document.getElementById('question-text'),
        optionsContainer: document.getElementById('options-container'),
        hintBtn: document.getElementById('hint-btn'),

        // Results Screen
        finalScoreValue: document.getElementById('final-score-value'),
        totalQuestionsValue: document.getElementById('total-questions-value'),
        correctAnswers: document.getElementById('correct-answers'),
        incorrectAnswers: document.getElementById('incorrect-answers'),
        resultsTopicText: document.getElementById('results-topic-text'),
        resultsActionButtons: document.getElementById('results-action-buttons'),
        unlockMessage: document.getElementById('unlock-message'),

        // Modals
        resetConfirmModal: document.getElementById('reset-confirm-modal'),
        cancelResetBtn: document.getElementById('cancel-reset-btn'),
        confirmResetBtn: document.getElementById('confirm-reset-btn'),
        reviewModal: document.getElementById('review-modal'),
        closeReviewModalBtn: document.getElementById('close-review-modal-btn'),
        reviewContent: document.getElementById('review-content'),
    });
}