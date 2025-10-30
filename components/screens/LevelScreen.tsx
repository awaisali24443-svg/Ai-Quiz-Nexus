
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Screen } from '../../types';
import { TOTAL_LEVELS } from '../../constants';
import Header from '../ui/Header';
import Footer from '../ui/Footer';

const LevelScreen: React.FC = () => {
    const { navigateTo, currentTopic, setCurrentLevel, userProgress } = useAppContext();

    if (!currentTopic) {
        navigateTo(Screen.HOME);
        return null;
    }

    const topicProgress = userProgress[currentTopic.id] || { highestLevelUnlocked: 1, scores: {} };
    const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);

    const handleLevelSelect = (level: number) => {
        if (level <= topicProgress.highestLevelUnlocked) {
            setCurrentLevel(level);
            navigateTo(Screen.QUIZ);
        }
    };

    const completionPercentage = Math.floor(((topicProgress.highestLevelUnlocked - 1) / TOTAL_LEVELS) * 100);

    return (
        <div className="relative min-h-screen bg-dark-bg bg-tech-circuit bg-cover bg-fixed">
            <div className="absolute inset-0 bg-black/80"></div>
            <Header />
            <main className="relative z-10 container mx-auto px-4 py-24 sm:py-32 flex flex-col items-center">
                <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-light-text">{currentTopic.title}</h1>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-medium-text">Level {topicProgress.highestLevelUnlocked} of {TOTAL_LEVELS}</h2>
                <div className="w-full max-w-xl bg-dark-card rounded-full h-4 mb-10">
                    <div className="bg-brand-primary h-4 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 w-full max-w-4xl mb-10">
                    {levels.map(level => {
                        const isUnlocked = level <= topicProgress.highestLevelUnlocked;
                        const isCompleted = level < topicProgress.highestLevelUnlocked;
                        const status = isCompleted ? 'Completed' : isUnlocked ? 'Available' : 'Locked';

                        return (
                            <div
                                key={level}
                                onClick={() => handleLevelSelect(level)}
                                className={`
                                    p-4 rounded-lg text-center transition-all duration-300 
                                    ${isUnlocked ? 'bg-dark-card border border-dark-border cursor-pointer hover:bg-brand-primary hover:border-brand-secondary' : 'bg-slate-900/50 border border-transparent text-slate-500 cursor-not-allowed'}
                                `}
                            >
                                <div className="text-2xl font-bold">{level}</div>
                                <div className="text-xs">{status}</div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => navigateTo(Screen.HOME)}
                        className="bg-dark-border hover:bg-slate-600 text-light-text font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                        &larr; Back to Topics
                    </button>
                    <button
                        onClick={() => handleLevelSelect(topicProgress.highestLevelUnlocked)}
                        className="bg-brand-primary hover:bg-dark-accent text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>
                        Start Level {topicProgress.highestLevelUnlocked}
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default LevelScreen;
