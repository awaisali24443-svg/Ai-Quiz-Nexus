// This module is dynamically imported by dashboard.js only when a quiz starts.
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js';

let localState = {};
let appState = {};
let dom = {};
let utils = {};
let timerIntervalId = null;
let loadingIntervalId = null;
let quizPromiseResolve = null;

const QUESTIONS_PER_QUIZ = 10;
const TIME_CHALLENGE_DURATION = 150; // 2 minutes 30 seconds
const loadingMessages = [
    "Contacting the AI oracle...",
    "Generating mind-bending questions...",
    "Calibrating difficulty matrix...",
    "Assembling your challenge...",
    "Waking up the AI..."
];

/**
 * Shows an animated loading message.
 */
function startLoadingAnimation() {
    stopLoadingAnimation();
    let messageIndex = 0;
    dom.loadingText.textContent = loadingMessages[messageIndex];
    loadingIntervalId = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        gsap.to(dom.loadingText, {
            opacity: 0, y: -10, duration: 0.3, onComplete: () => {
                dom.loadingText.textContent = loadingMessages[messageIndex];
                gsap.to(dom.loadingText, { opacity: 1, y: 0, duration: 0.3 });
            }
        });
    }, 2000);
}

/**
 * Stops the loading message animation.
 */
function stopLoadingAnimation() {
    clearInterval(loadingIntervalId);
    loadingIntervalId = null;
}

/**
 * Resets the local state for a new quiz.
 */
function resetLocalState() {
    cleanupQuiz(); // Ensure everything is stopped before resetting
    localState = {
        questions: [],
        currentQuestionIndex: 0,
        score: 0,
        answerSubmitted: false,
        isComplete: false,
    };
}

/**
 * Stops the quiz timer.
 */
function stopTimer() {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
}

/**
 * Starts the quiz timer.
 * @param {number} duration - The timer duration in seconds.
 */
function startTimer(duration) {
    stopTimer();
    let timer = duration;

    const updateTimerDisplay = () => {
        const minutes = String(Math.floor(timer / 60)).padStart(2, '0');
        const seconds = String(timer % 60).padStart(2, '0');
        dom.quizTimer.textContent = `${minutes}:${seconds}`;
        dom.quizTimer.classList.toggle('low-time', timer <= 30);
    };

    updateTimerDisplay(); // Initial display

    timerIntervalId = setInterval(() => {
        timer--;
        updateTimerDisplay();

        if (timer < 0) {
            utils.playSound('incorrect');
            completeQuiz({ timedOut: true });
        }
    }, 1000);
}

/**
 * Renders the current quiz question and options.
 */
function renderQuizQuestion() {
    const { questions, currentQuestionIndex } = localState;
    if (!questions || questions.length === 0) return;
    const question = questions[currentQuestionIndex];
    
    dom.questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    dom.quizProgressBar.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;
    dom.questionText.textContent = question.q;

    dom.optionsContainer.innerHTML = '';
    const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
    shuffledOptions.forEach(optionText => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = optionText;
        btn.onclick = () => handleAnswerSelection(btn);
        dom.optionsContainer.appendChild(btn);
    });
    
    // Animate the question in
    const quizBody = dom.questionText.parentElement;
    gsap.fromTo(quizBody, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    gsap.fromTo('.option-btn', 
        { opacity: 0, x: -20 }, 
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.2 }
    );
}

/**
 * Handles the user's selection of an answer.
 * @param {HTMLButtonElement} selectedButton - The button that was clicked.
 */
function handleAnswerSelection(selectedButton) {
    if (localState.answerSubmitted) return;
    localState.answerSubmitted = true;

    const selectedAnswer = selectedButton.textContent;
    const question = localState.questions[localState.currentQuestionIndex];
    const isCorrect = selectedAnswer === question.answer;

    question.yourAnswer = selectedAnswer; // Store user's answer for review

    utils.playSound(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
        localState.score++;
    }

    // Visually provide feedback
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === question.answer) btn.classList.add('correct');
        else if (btn === selectedButton) btn.classList.add('incorrect');
    });

    // Animate out after a delay, then move to the next question
    setTimeout(() => {
        const quizBody = dom.questionText.parentElement;
        gsap.to(quizBody, {
            opacity: 0, y: -30, duration: 0.4, ease: 'power2.in',
            onComplete: () => advanceToNextQuestion()
        });
    }, 1500);
}

/**
 * Advances the quiz to the next question or completes it if it's the last one.
 */
function advanceToNextQuestion() {
    if (localState.isComplete) return;

    if (localState.currentQuestionIndex < localState.questions.length - 1) {
        localState.currentQuestionIndex++;
        localState.answerSubmitted = false;
        renderQuizQuestion();
    } else {
        completeQuiz();
    }
}

/**
 * Finalizes the quiz and resolves the main promise.
 * @param {object} [options={}] - Optional completion flags like `timedOut`.
 */
function completeQuiz(options = {}) {
    if (localState.isComplete) return;
    localState.isComplete = true;
    stopTimer();

    if (quizPromiseResolve) {
        quizPromiseResolve({
            score: localState.score,
            timedOut: options.timedOut || false,
            questions: localState.questions,
            error: false
        });
        quizPromiseResolve = null;
    }
}

/**
 * Fetches quiz questions from the API or falls back to local data.
 * @param {string[]} answeredQuestions - A list of previous questions to avoid repetition.
 * @returns {Promise<object[]>} A promise that resolves with the array of questions.
 */
async function getQuizQuestions(answeredQuestions) {
    if (navigator.onLine) {
         try {
            const endpoint = appState.gameMode === 'topic' ? '/api/generate-quiz' : '/api/generate-time-challenge';
            const body = appState.gameMode === 'topic' 
                ? { topic: appState.currentTopic.title, level: appState.currentLevel, answeredQuestions } 
                : {};
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!response.ok) { const err = await response.json(); throw new Error(err.message); }
            const data = await response.json();
            if (!data.questions || data.questions.length === 0) throw new Error("AI returned no questions.");
            return data.questions;
        } catch (error) {
            utils.showToast(`AI generation failed: ${error.message}. Using offline questions.`, true);
        }
    }
    
    if (appState.gameMode === 'timeChallenge') {
        throw new Error('Time Challenge requires an internet connection.');
    }
    return utils.getFallbackQuestions(appState.currentTopic.title, appState.currentLevel);
}

/**
 * Cleans up all resources used by the quiz controller.
 */
export function cleanupQuiz() {
    stopTimer();
    stopLoadingAnimation();
    if (quizPromiseResolve) {
        // If a quiz is in progress and we navigate away, resolve with an error state
        quizPromiseResolve({ error: true, message: "Quiz aborted" });
        quizPromiseResolve = null;
    }
}

/**
 * The main entry point to start and run a quiz.
 * @returns {Promise<object>} A promise that resolves with the quiz results.
 */
export function runQuiz(initialAppState, domElements, sharedUtils, answeredQuestions = []) {
    return new Promise(async (resolve) => {
        quizPromiseResolve = resolve;
        appState = initialAppState;
        dom = domElements;
        utils = sharedUtils;

        resetLocalState();
        dom.quizProgressBar.style.width = '0%';
        utils.showLoading(true);
        startLoadingAnimation();

        try {
            const questions = await getQuizQuestions(answeredQuestions);
            localState.questions = questions.slice(0, QUESTIONS_PER_QUIZ);
            
            if (appState.gameMode === 'timeChallenge') {
                dom.quizTimer.classList.remove('hidden');
                startTimer(TIME_CHALLENGE_DURATION);
            } else {
                dom.quizTimer.classList.add('hidden');
            }
            
            renderQuizQuestion();
        } catch (error) {
            console.error(error);
            utils.showToast(`Failed to start quiz: ${error.message}`, true);
            completeQuiz({ error: true });
        } finally {
            utils.showLoading(false);
            stopLoadingAnimation();
        }
    });
}
