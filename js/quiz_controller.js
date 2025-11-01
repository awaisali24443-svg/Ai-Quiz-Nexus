import { SupabaseClient } from './supabase-client.js';

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
        hintUsedThisQuestion: false,
        timedOut: false
    };
}

function stopTimer() {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
}

function startTimer(duration, onTimeout) {
    let timer = duration;
    if (timerIntervalId) stopTimer();

    timerIntervalId = setInterval(() => {
        const minutes = String(Math.floor(timer / 60)).padStart(2, '0');
        const seconds = String(timer % 60).padStart(2, '0');
        
        dom.quizTimer.textContent = `${minutes}:${seconds}`;
        dom.quizTimer.classList.toggle('low-time', timer <= 30);

        if (--timer < 0) {
            utils.playSound('incorrect');
            quizState.timedOut = true;
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

    if (appState.isGuest) {
        dom.quizHintBtn.classList.add('hidden');
    } else {
        dom.quizHintBtn.classList.remove('hidden');
        dom.quizHintsLeft.textContent = appState.userProgress.totalHints;
        dom.quizHintBtn.disabled = appState.userProgress.totalHints <= 0 || quizState.hintUsedThisQuestion;
    }


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

    utils.playSound(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
        quizState.score += quizState.hintUsedThisQuestion ? 0.5 : 1;
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
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
        quizState.currentQuestionIndex++;
        quizState.answerSubmitted = false;
        quizState.hintUsedThisQuestion = false;
        renderQuizQuestion();
    } else {
        stopTimer();
        window.dispatchEvent(new CustomEvent('quizComplete', { detail: quizState }));
    }
}

function handleHint() {
    if (appState.isGuest || appState.userProgress.totalHints <= 0 || quizState.hintUsedThisQuestion) return;
    
    utils.playSound('click');
    appState.userProgress.totalHints--;
    
    // This change will be saved to Supabase in dashboard.js after the quiz
    dom.quizHintsLeft.textContent = appState.userProgress.totalHints;
    dom.quizHintBtn.disabled = true;
    quizState.hintUsedThisQuestion = true;


    const question = quizState.questions[quizState.currentQuestionIndex];
    const incorrectOptions = Array.from(document.querySelectorAll('.option-btn')).filter(btn => btn.textContent !== question.answer);
    
    if (incorrectOptions.length > 1) {
        const optionToDisable = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
        optionToDisable.classList.add('hint-disabled');
    }
}

async function getQuizQuestions(prefetchPromise, answeredQuestions) {
    // 1. Try to load from Supabase first (for non-guest users in topic mode)
    if (!appState.isGuest && appState.gameMode === 'topic') {
        const dbQuestions = await SupabaseClient.loadQuestions(appState.currentTopic.dbId, appState.currentLevel);
        if (dbQuestions && dbQuestions.length >= QUESTIONS_PER_QUIZ) {
            utils.showToast("📚 Questions loaded from database.");
            return dbQuestions;
        }
    }

    // 2. Fallback to AI generation (if online)
    if (prefetchPromise) {
        utils.showToast("⚡ Prefetched AI quiz loaded!");
        const data = await prefetchPromise;
        if (!data.questions || data.questions.length === 0) throw new Error("Prefetched data was invalid.");
        return data.questions;
    }

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
            // Fall through to offline questions
        }
    }
    
    // 3. Fallback to local questions (if offline or AI fails)
    if (appState.gameMode === 'timeChallenge') {
        throw new Error('Time Challenge requires an internet connection.');
    }
    utils.showToast('⚠️ Using offline fallback questions.', true);
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
                questions: e.detail.questions // Pass back the questions for history
            });
            window.removeEventListener('quizComplete', onQuizComplete);
        };
        window.addEventListener('quizComplete', onQuizComplete);

        resetQuizState();
        dom.quizProgressBar.style.width = '0%';
        dom.quizHintBtn.removeEventListener('click', handleHint); // Remove old listener before adding new one
        dom.quizHintBtn.addEventListener('click', handleHint);
        utils.showLoading(true, "Crafting your challenge...");

        try {
            const questions = await getQuizQuestions(prefetchPromise, answeredQuestions);
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