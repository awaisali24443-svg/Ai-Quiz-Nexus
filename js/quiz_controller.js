// This module is dynamically imported by dashboard.js only when a quiz starts.

let quizState = {};
let appState = {};
let dom = {};
let utils = {};
let timerIntervalId = null;

const QUESTIONS_PER_QUIZ = 10;

function resetQuizState() {
    stopTimer();
    quizState = {
        questions: [],
        currentQuestionIndex: 0,
        score: 0,
        answerSubmitted: false,
        timedOut: false,
        isComplete: false,
    };
}

function stopTimer() {
    if (timerIntervalId) clearInterval(timerIntervalId);
    timerIntervalId = null;
}

function startTimer(duration, onTimeout) {
    let timer = duration;
    stopTimer();

    timerIntervalId = setInterval(() => {
        const minutes = String(Math.floor(timer / 60)).padStart(2, '0');
        const seconds = String(timer % 60).padStart(2, '0');
        
        dom.quizTimer.textContent = `${minutes}:${seconds}`;
        dom.quizTimer.classList.toggle('low-time', timer <= 30);

        if (--timer < 0) {
            if (quizState.isComplete) return;
            utils.playSound('incorrect');
            quizState.timedOut = true;
            quizState.isComplete = true;
            stopTimer();
            onTimeout(quizState);
        }
    }, 1000);
}

function renderQuizQuestion() {
    const { questions, currentQuestionIndex } = quizState;
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
        btn.addEventListener('click', () => handleAnswerSelection(btn));
        dom.optionsContainer.appendChild(btn);
    });

    const quizBody = document.querySelector('.quiz-body');
    gsap.fromTo(quizBody, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    gsap.fromTo('.option-btn', 
        { opacity: 0, x: -20 }, 
        { 
            opacity: 1, 
            x: 0, 
            duration: 0.4, 
            stagger: 0.08, 
            ease: 'power2.out', 
            delay: 0.2 
        }
    );
}

function handleAnswerSelection(selectedButton) {
    if (quizState.answerSubmitted) return;
    quizState.answerSubmitted = true;

    const selectedAnswer = selectedButton.textContent;
    const question = quizState.questions[quizState.currentQuestionIndex];
    const isCorrect = selectedAnswer === question.answer;

    question.yourAnswer = selectedAnswer; // Store user's answer for review

    utils.playSound(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
        quizState.score++;
    }

    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === question.answer) btn.classList.add('correct');
        else if (btn === selectedButton) btn.classList.add('incorrect');
    });

    setTimeout(() => {
        gsap.to('.quiz-body', {
            opacity: 0, y: -30, duration: 0.4, ease: 'power2.in',
            onComplete: () => handleNextQuestion()
        });
    }, 2000);
}

function handleNextQuestion() {
    if (quizState.isComplete) return;

    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
        quizState.currentQuestionIndex++;
        quizState.answerSubmitted = false;
        renderQuizQuestion();
    } else {
        quizState.isComplete = true;
        stopTimer();
        window.dispatchEvent(new CustomEvent('quizComplete', { detail: quizState }));
    }
}

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

export function cleanupQuiz() {
    stopTimer();
}

export function runQuiz(prefetchPromise, initialState, domElements, sharedUtils, answeredQuestions = []) {
    return new Promise(async (resolve) => {
        appState = initialState;
        dom = domElements;
        utils = sharedUtils;

        const onQuizComplete = (e) => {
            resolve({ 
                score: e.detail.score, 
                timedOut: e.detail.timedOut,
                questions: e.detail.questions
            });
            window.removeEventListener('quizComplete', onQuizComplete);
        };
        window.addEventListener('quizComplete', onQuizComplete);

        resetQuizState();
        dom.quizProgressBar.style.width = '0%';
        utils.showLoading(true, "Crafting your challenge...");

        try {
            const questions = await getQuizQuestions(answeredQuestions);
            quizState.questions = questions.sort(() => 0.5 - Math.random()).slice(0, QUESTIONS_PER_QUIZ);
            
            if (appState.gameMode === 'timeChallenge') {
                dom.quizTimer.classList.remove('hidden');
                startTimer(150, () => window.dispatchEvent(new CustomEvent('quizComplete', { detail: quizState })));
            } else {
                dom.quizTimer.classList.add('hidden');
            }
            
            renderQuizQuestion();
        } catch (error) {
            console.error(error);
            utils.showToast(`Failed to start quiz: ${error.message}`, true);
            resolve({ error: true });
        } finally {
            utils.showLoading(false);
        }
    });
}