
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { TOPICS } from '../../constants';
import Header from '../ui/Header';
import Footer from '../ui/Footer';

const ProfileScreen: React.FC = () => {
    const { userProgress } = useAppContext();

    const stats = Object.values(userProgress).reduce((acc, topicProgress) => {
        const quizzesTaken = Object.keys(topicProgress.scores).length;
        const totalScore = Object.values(topicProgress.scores).reduce((sum, score) => sum + score, 0);
        const levelsCleared = topicProgress.highestLevelUnlocked -1;

        acc.quizzesTaken += quizzesTaken;
        acc.totalCorrect += totalScore;
        acc.levelsCleared += levelsCleared;
        return acc;
    }, { quizzesTaken: 0, totalCorrect: 0, levelsCleared: 0 });

    const accuracy = stats.quizzesTaken > 0 ? ((stats.totalCorrect / (stats.quizzesTaken * 10)) * 100).toFixed(0) : 0;

    return (
        <div className="min-h-screen bg-dark-bg bg-profile-bg bg-cover bg-fixed">
            <Header />
            <main className="container mx-auto px-4 py-24 sm:py-32">
                <div className="max-w-4xl mx-auto">
                    {/* Profile Header */}
                    <div className="bg-dark-card/80 backdrop-blur-lg border border-dark-border rounded-2xl p-8 mb-8 flex flex-col items-center">
                        <img src="https://picsum.photos/seed/avatar/100/100" alt="Aisha Khan" className="w-24 h-24 rounded-full border-4 border-brand-primary mb-4" />
                        <h1 className="text-3xl font-bold">Aisha Khan</h1>
                        <p className="text-green-400 text-sm mb-4">Online</p>
                        <button className="bg-dark-border hover:bg-slate-600 text-light-text text-sm font-bold py-2 px-4 rounded-lg transition-colors">Edit Profile</button>
                        
                        <div className="grid grid-cols-3 gap-4 text-center w-full mt-8 pt-8 border-t border-dark-border">
                            <div>
                                <p className="text-3xl font-bold">{stats.quizzesTaken}</p>
                                <p className="text-medium-text text-sm">QUIZZES TAKEN</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold">{accuracy}%</p>
                                <p className="text-medium-text text-sm">ACCURACY</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold">{stats.levelsCleared}</p>
                                <p className="text-medium-text text-sm">LEVELS CLEARED</p>
                            </div>
                        </div>
                    </div>

                    {/* App Preferences */}
                    <div className="bg-dark-card/80 backdrop-blur-lg border border-dark-border rounded-2xl p-8 mb-8">
                         <h2 className="text-xl font-bold mb-6">App Preferences</h2>
                         <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-medium-text">Sound Effects</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                                  <div className="w-11 h-6 bg-dark-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                                </label>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-medium-text">Theme Mode</span>
                                 <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" value="" className="sr-only peer" defaultChecked/>
                                  <div className="w-11 h-6 bg-dark-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                                </label>
                            </div>
                         </div>
                    </div>

                    {/* Quiz Progress & History */}
                    <div className="bg-dark-card/80 backdrop-blur-lg border border-dark-border rounded-2xl p-8">
                        <h2 className="text-xl font-bold mb-6">Quiz Progress & History</h2>
                        {Object.keys(userProgress).length > 0 ? Object.entries(userProgress).map(([topicId, progress]) => {
                             const topic = TOPICS.find(t => t.id === topicId);
                             if (!topic) return null;
                             const totalLevelsCompleted = progress.highestLevelUnlocked -1;
                             const progressPercent = (totalLevelsCompleted / 30 * 100).toFixed(0);
                             const highestScore = Math.max(0, ...Object.values(progress.scores));

                             return (
                                <div key={topicId} className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-3">
                                            <topic.icon className="w-6 h-6 text-brand-secondary"/>
                                            <span className="font-semibold">{topic.title}</span>
                                        </div>
                                        <span className="text-sm text-medium-text">{totalLevelsCompleted} / 30 ({progressPercent}%)</span>
                                    </div>
                                    <div className="w-full bg-dark-border rounded-full h-2.5">
                                        <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                                    </div>
                                    <p className="text-xs text-medium-text mt-1">Highest Score: {highestScore}/10</p>
                                </div>
                             );
                        }) : <p className="text-medium-text">No quiz history yet. Start a quiz to see your progress!</p>}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ProfileScreen;
