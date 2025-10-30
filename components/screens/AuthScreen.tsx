
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Screen } from '../../types';

const AuthScreen: React.FC = () => {
  const { navigateTo } = useAppContext();

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      <div className="w-full max-w-md bg-dark-card rounded-2xl shadow-2xl p-8 border border-dark-border">
        <h2 className="text-3xl font-bold text-center text-light-text mb-2">Welcome to AI Quiz Nexus</h2>
        <p className="text-center text-medium-text mb-8">Your journey to knowledge mastery begins here.</p>
        
        <form className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-medium-text mb-2">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="your.email@example.com"
              className="w-full bg-slate-900/70 border border-dark-border rounded-lg px-4 py-3 text-light-text placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-medium-text mb-2">Password</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Minimum 8 characters"
              className="w-full bg-slate-900/70 border border-dark-border rounded-lg px-4 py-3 text-light-text placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            <p className="text-xs text-slate-500 mt-2">Password must be at least 8 characters.</p>
          </div>
          
          <button 
            type="button"
            className="w-full bg-brand-primary hover:bg-dark-accent text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
          >
            Login
          </button>
        </form>
        
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-dark-border"></div>
          <span className="flex-shrink mx-4 text-medium-text">OR</span>
          <div className="flex-grow border-t border-dark-border"></div>
        </div>
        
        <button 
          type="button"
          className="w-full bg-dark-border/50 hover:bg-dark-border text-light-text font-bold py-3 px-4 rounded-lg transition-colors duration-300 mb-4"
        >
          Sign Up
        </button>

        <button 
          onClick={() => navigateTo(Screen.HOME)}
          className="w-full text-center text-medium-text hover:text-brand-primary font-semibold transition-colors duration-300"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
};

export default AuthScreen;
