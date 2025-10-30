
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Screen, Topic } from '../../types';
import { TOPICS } from '../../constants';
import Header from '../ui/Header';

const TopicCard: React.FC<{ topic: Topic, onClick: () => void }> = ({ topic, onClick }) => (
    <div 
        onClick={onClick}
        className="group relative bg-dark-card rounded-2xl overflow-hidden p-6 border border-dark-border hover:border-brand-primary transition-all duration-300 cursor-pointer shadow-lg hover:shadow-brand-primary/20 transform hover:-translate-y-1"
    >
        <img src={topic.image} alt={topic.title} className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity duration-300"/>
        <div className="relative z-10">
            <div className="mb-4 text-brand-secondary">
                <topic.icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-light-text mb-2">{topic.title}</h3>
            <p className="text-medium-text text-sm">{topic.description}</p>
        </div>
    </div>
);

const HomeScreen: React.FC = () => {
    const { navigateTo, setCurrentTopic } = useAppContext();

    const handleTopicSelect = (topic: Topic) => {
        setCurrentTopic(topic);
        navigateTo(Screen.LEVEL);
    };

    return (
        <div className="min-h-screen bg-dark-bg bg-profile-bg bg-cover bg-fixed">
            <Header />
            <main className="container mx-auto px-4 py-24 sm:py-32">
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-light-text mb-3">Welcome to AI Quiz Nexus!</h1>
                    <p className="text-lg text-medium-text">Choose your adventure and master new fields with AI-powered quizzes.</p>
                </div>

                <h2 className="text-3xl font-bold mb-8 text-light-text">Explore Topics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TOPICS.map(topic => (
                        <TopicCard key={topic.id} topic={topic} onClick={() => handleTopicSelect(topic)} />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default HomeScreen;
