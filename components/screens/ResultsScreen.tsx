import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Screen } from '../../types';
import { generateAiFeedback } from '../../services/geminiService';
import { QUESTIONS_PER_QUIZ, SCORE_TO_UNLOCK_NEXT_LEVEL } from '../../constants';
import Spinner from '../ui/Spinner';
import Header from '../ui/Header';
import Footer from '../ui/Footer';

const ResultsScreen: React.FC = () => {
    const { navigateTo, currentTopic, currentLevel, setCurrentLevel, lastScore } = useAppContext();
    const [feedback, setFeedback] = useState('');
    const [loadingFeedback, setLoadingFeedback] = useState(true);

    useEffect(() => {
        if (currentTopic) {
            generateAiFeedback(currentTopic.title, lastScore, QUESTIONS_PER_QUIZ)
                .then(setFeedback)
                .finally(() => setLoadingFeedback(false));
        }
    }, [currentTopic, lastScore]);

    if (!currentTopic) {
        navigateTo(Screen.HOME);
        return null;
    }

    const nextLevelUnlocked = lastScore >= SCORE_TO_UNLOCK_NEXT_LEVEL;
    const scorePercentage = (lastScore / QUESTIONS_PER_QUIZ) * 100;

    const handleNextLevel = () => {
        setCurrentLevel(currentLevel + 1);
        navigateTo(Screen.QUIZ);
    };

    const handleRetry = () => {
        navigateTo(Screen.QUIZ);
    };

    const handleHome = () => {
        navigateTo(Screen.HOME);
    };

    return (
        <div className="relative min-h-screen bg-results-bg bg-cover bg-center flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
            <Header />

            <main className="relative z-10 text-center text-white">
                <h1 className="text-4xl font-bold mb-2">Quiz Complete!</h1>
                <p className="text-lg text-medium-text mb-6">Here's your performance for {currentTopic.title}</p>
                
                <div className="text-8xl font-extrabold text-yellow-400 drop-shadow-lg">{lastScore}<span className="text-5xl text-white">/{QUESTIONS_PER_QUIZ}</span></div>
                
                <div className="flex justify-center gap-8 my-6">
                    <div>
                        <p className="text-4xl font-bold text-green-400">{lastScore}</p>
                        <p className="text-sm font-semibold text-medium-text tracking-widest">CORRECT</p>
                    </div>
                    <div>
                        <p className="text-4xl font-bold text-red-500">{QUESTIONS_PER_QUIZ - lastScore}</p>
                        <p className="text-sm font-semibold text-medium-text tracking-widest">INCORRECT</p>
                    </div>
                </div>
                
                <div className="w-full max-w-md bg-dark-card/50 rounded-full h-4 mx-auto mb-8">
                    <div className="bg-yellow-400 h-4 rounded-full" style={{ width: `${scorePercentage}%` }}></div>
                </div>

                {nextLevelUnlocked && <div className="text-xl font-semibold text-green-400 mb-6">Congratulations, Next Level Unlocked!</div>}

                <div className="flex justify-center gap-4 mb-8">
                    {nextLevelUnlocked && (
                        <button onClick={handleNextLevel} className="bg-brand-primary hover:bg-dark-accent text-white font-bold py-3 px-6 rounded-lg transition-colors">
                            Next Level
                        </button>
                    )}
                    <button onClick={handleRetry} className="bg-dark-border hover:bg-slate-600 text-light-text font-bold py-3 px-6 rounded-lg transition-colors">
                        Retry
                    </button>
                    <button onClick={handleHome} className="bg-black/50 hover:bg-black/80 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                        Home
                    </button>
                </div>

                <div className="max-w-2xl mx-auto bg-yellow-400/10 border-2 border-yellow-400 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-yellow-400 mb-2">AI Feedback</h3>
                    {loadingFeedback ? <Spinner text="Generating feedback..."/> : <p className="text-yellow-100">{feedback}</p>}
                </div>
            </main>
            <Footer/>
        </div>
    );
};

export default ResultsScreen;