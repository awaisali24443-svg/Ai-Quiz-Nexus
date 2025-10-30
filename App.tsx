
import React from 'react';
import { useAppContext } from './context/AppContext';
import { Screen } from './types';
import WelcomeScreen from './components/screens/WelcomeScreen';
import AuthScreen from './components/screens/AuthScreen';
import HomeScreen from './components/screens/HomeScreen';
import LevelScreen from './components/screens/LevelScreen';
import QuizScreen from './components/screens/QuizScreen';
import ResultsScreen from './components/screens/ResultsScreen';
import ProfileScreen from './components/screens/ProfileScreen';

const App: React.FC = () => {
  const { screen } = useAppContext();

  const renderScreen = () => {
    switch (screen) {
      case Screen.WELCOME:
        return <WelcomeScreen />;
      case Screen.AUTH:
        return <AuthScreen />;
      case Screen.HOME:
        return <HomeScreen />;
      case Screen.LEVEL:
        return <LevelScreen />;
      case Screen.QUIZ:
        return <QuizScreen />;
      case Screen.RESULTS:
        return <ResultsScreen />;
      case Screen.PROFILE:
        return <ProfileScreen />;
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {renderScreen()}
    </div>
  );
};

export default App;
