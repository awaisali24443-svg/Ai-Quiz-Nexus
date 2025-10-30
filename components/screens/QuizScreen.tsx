import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Screen, QuizQuestion } from '../../types';
import { generateQuizQuestions } from '../../services/geminiService';
import { QUESTIONS_PER_QUIZ, TIMER_SECONDS_PER_QUESTION, SCORE_TO_UNLOCK_NEXT_LEVEL } from '../../constants';
import { useQuizTimer } from '../../hooks/useQuizTimer';
import Spinner from '../ui/Spinner';
import Header from '../ui/Header';

const QuizScreen: React.FC = () => {
    const { navigateTo, currentTopic, currentLevel, saveScore, unlockNextLevel } = useAppContext();
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [answerSubmitted, setAnswerSubmitted] = useState(false);

    // FIX: Reordered hook and callback declarations to resolve a "used before declaration" error.
    // The circular dependency (submit -> stop -> timer -> timeout -> submit) is resolved by
    // defining `handleAnswerSubmit` after `useQuizTimer` so it can access `stop`. `handleTimeout`
    // is also defined after `handleAnswerSubmit` to access it. `useQuizTimer` receives `handleTimeout`,
    // which works because the callback is only invoked after all declarations have been made.
    const handleAnswerSubmit = useCallback(() => {
        if (answerSubmitted) return;
        stop();
        const isCorrect = selectedAnswer === questions[currentQuestionIndex].correctAnswerIndex;

        if (isCorrect) {
            setScore(prev => prev + 1);
        }
        setAnswerSubmitted(true);
    }, [answerSubmitted, questions, currentQuestionIndex, selectedAnswer, stop]);

    const handleTimeout = useCallback(() => {
        handleAnswerSubmit();
    }, [handleAnswerSubmit]);

    const { timeLeft, start, stop, reset } = useQuizTimer(TIMER_SECONDS_PER_QUESTION - (currentLevel > 15 ? 15 : currentLevel), handleTimeout);

    useEffect(() => {
        if (!currentTopic) {
            navigateTo(Screen.HOME);
            return;
        }

        const fetchQuestions = async () => {
            setLoading(true);
            setError(null);
            try {
                const fetchedQuestions = await generateQuizQuestions(currentTopic.title, currentLevel);
                if (fetchedQuestions.length > 0) {
                    setQuestions(fetchedQuestions.slice(0, QUESTIONS_PER_QUIZ));
                    start();
                } else {
                    setError("Failed to load quiz questions. Please try again.");
                }
            } catch (err) {
                setError("An error occurred while fetching questions.");
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTopic, currentLevel, navigateTo]);
    
    const handleQuit = () => {
        stop();
        navigateTo(Screen.LEVEL);
    }
    
    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setAnswerSubmitted(false);
            reset();
            start();
        } else {
            // Quiz finished
            if(currentTopic) {
                saveScore(currentTopic.id, currentLevel, score);
                if (score >= SCORE_TO_UNLOCK_NEXT_LEVEL) {
                    unlockNextLevel(currentTopic.id);
                }
            }
            navigateTo(Screen.RESULTS);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-dark-bg"><Spinner text="Generating your quiz..." /></div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center bg-dark-bg text-red-500">{error}</div>;
    }

    if (questions.length === 0) {
        return <div className="min-h-screen flex items-center justify-center bg-dark-bg">No questions available.</div>;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
    const optionLabels = ['A', 'B', 'C', 'D'];

    return (
        <div className="relative min-h-screen bg-quiz-bg bg-cover bg-center flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>
            <Header showQuit={true} onQuit={handleQuit} />
            
            <main className="relative z-10 w-full max-w-4xl">
                <div className="bg-dark-card/50 backdrop-blur-lg border border-dark-border p-6 rounded-t-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-lg font-bold">Time Left: <span className="text-brand-secondary text-2xl">00:{timeLeft.toString().padStart(2, '0')}</span></div>
                        <div>Question {currentQuestionIndex + 1} of {questions.length}</div>
                    </div>
                    <div className="w-full bg-dark-border rounded-full h-2.5">
                        <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>

                <div className="bg-dark-card/80 backdrop-blur-lg border-x border-b border-dark-border p-8 rounded-b-2xl">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-light-text">{currentQuestion.question}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {currentQuestion.options.map((option, index) => {
                            const isCorrectAnswer = index === currentQuestion.correctAnswerIndex;
                            const isSelectedAnswer = selectedAnswer === index;

                            let buttonClass = 'bg-slate-900/50 border-dark-border hover:border-brand-primary';
                            if (answerSubmitted) {
                                if (isCorrectAnswer) {
                                    buttonClass = 'bg-green-600 border-green-500 text-white';
                                } else if (isSelectedAnswer) {
                                    buttonClass = 'bg-red-600 border-red-500 text-white';
                                } else {
                                    buttonClass = 'bg-slate-900/50 border-dark-border opacity-60';
                                }
                            } else if (isSelectedAnswer) {
                                buttonClass = 'bg-brand-primary border-brand-secondary text-white';
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => setSelectedAnswer(index)}
                                    disabled={answerSubmitted}
                                    className={`p-4 rounded-lg text-left transition-all duration-200 border-2 ${buttonClass}`}
                                >
                                    <span className="font-bold mr-3 text-brand-secondary">{optionLabels[index]}</span>
                                    <span>{option}</span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex justify-center gap-4">
                         <button onClick={handleQuit} className="bg-dark-border hover:bg-slate-600 text-light-text font-bold py-3 px-8 rounded-lg transition-colors">Home</button>
                         {answerSubmitted ? (
                            <button onClick={handleNextQuestion} className="bg-brand-primary hover:bg-dark-accent text-white font-bold py-3 px-8 rounded-lg transition-colors">
                                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                            </button>
                         ) : (
                            <button onClick={handleAnswerSubmit} disabled={selectedAnswer === null} className="bg-brand-primary hover:bg-dark-accent text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
                                Submit Answer
                            </button>
                         )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default QuizScreen;