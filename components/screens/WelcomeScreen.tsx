
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Screen } from '../../types';

const WelcomeScreen: React.FC = () => {
  const { navigateTo } = useAppContext();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-tech-circuit bg-cover bg-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="relative z-10 text-center text-white px-4">
        <div className="flex justify-center items-center gap-3 mb-6">
            <div className="bg-brand-primary p-3 rounded-xl">
                 <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
            </div>
            <h1 className="text-3xl font-bold">AI Quiz Nexus</h1>
        </div>
        <h2 className="text-4xl md:text-6xl font-extrabold mb-8 leading-tight">
          Master Every Field Through AI Intelligence.
        </h2>
        <button
          onClick={() => navigateTo(Screen.AUTH)}
          className="bg-brand-primary hover:bg-dark-accent text-white font-bold py-3 px-10 rounded-full text-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg shadow-brand-primary/30"
        >
          Start Your Journey
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
