
import React from 'react';

export enum Screen {
  WELCOME,
  AUTH,
  HOME,
  LEVEL,
  QUIZ,
  RESULTS,
  PROFILE,
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface LevelProgress {
  highestLevelUnlocked: number;
  scores: { [level: number]: number };
}

export interface UserProgress {
  [topicId: string]: LevelProgress;
}

export interface AppContextType {
  screen: Screen;
  navigateTo: (screen: Screen) => void;
  currentTopic: Topic | null;
  setCurrentTopic: (topic: Topic | null) => void;
  currentLevel: number;
  setCurrentLevel: (level: number) => void;
  userProgress: UserProgress;
  unlockNextLevel: (topicId: string) => void;
  saveScore: (topicId: string, level: number, score: number) => void;
  lastScore: number;
  setLastScore: (score: number) => void;
}
