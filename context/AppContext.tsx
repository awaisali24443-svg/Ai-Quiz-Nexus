
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { AppContextType, Screen, Topic, UserProgress } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [screen, setScreen] = useState<Screen>(Screen.WELCOME);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [userProgress, setUserProgress] = useState<UserProgress>({});
  const [lastScore, setLastScore] = useState<number>(0);

  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem('userProgress');
      if (savedProgress) {
        setUserProgress(JSON.parse(savedProgress));
      }
    } catch (error) {
      console.error("Failed to load user progress from localStorage", error);
    }
  }, []);

  const saveProgressToLocalStorage = (progress: UserProgress) => {
    try {
      localStorage.setItem('userProgress', JSON.stringify(progress));
    } catch (error) {
      console.error("Failed to save user progress to localStorage", error);
    }
  };

  const navigateTo = (newScreen: Screen) => {
    setScreen(newScreen);
  };

  const unlockNextLevel = (topicId: string) => {
    setUserProgress(prev => {
      const newProgress = { ...prev };
      const currentTopicProgress = newProgress[topicId] || { highestLevelUnlocked: 1, scores: {} };
      const nextLevel = currentTopicProgress.highestLevelUnlocked + 1;
      
      if (nextLevel > currentTopicProgress.highestLevelUnlocked) {
        currentTopicProgress.highestLevelUnlocked = nextLevel;
      }
      
      newProgress[topicId] = currentTopicProgress;
      saveProgressToLocalStorage(newProgress);
      return newProgress;
    });
  };

  const saveScore = (topicId: string, level: number, score: number) => {
    setUserProgress(prev => {
      const newProgress = { ...prev };
      const currentTopicProgress = newProgress[topicId] || { highestLevelUnlocked: 1, scores: {} };
      currentTopicProgress.scores[level] = Math.max(currentTopicProgress.scores[level] || 0, score);
      
      newProgress[topicId] = currentTopicProgress;
      saveProgressToLocalStorage(newProgress);
      return newProgress;
    });
    setLastScore(score);
  };

  const value = {
    screen,
    navigateTo,
    currentTopic,
    setCurrentTopic,
    currentLevel,
    setCurrentLevel,
    userProgress,
    unlockNextLevel,
    saveScore,
    lastScore,
    setLastScore,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
