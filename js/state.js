
export const TOTAL_LEVELS = 30;
export const SCORE_TO_UNLOCK_NEXT_LEVEL = 7;

export const Screen = {
    HOME: 'home-screen',
    PROFILE: 'profile-screen',
    LEVEL: 'level-screen',
    QUIZ: 'quiz-screen',
    RESULTS: 'results-screen',
};

export const TOPICS = [
    { id: 'programming', title: 'Programming', description: 'Test your knowledge in syntax, algorithms, and data structures across various languages.' },
    { id: 'technology_ai', title: 'AI & Technology', description: 'Explore concepts of machine learning, neural networks, and modern tech innovations.' },
    { id: 'space_astronomy', title: 'Space & Astronomy', description: 'Journey through the cosmos, from planets and stars to galaxies and black holes.' },
    { id: 'science_inventions', title: 'Science & Inventions', description: 'Learn about the groundbreaking inventions and discoveries that shaped our world.' },
    { id: 'biology', title: 'Biology', description: 'Explore the mysteries of life, from cellular structures to complex ecosystems.' },
    { id: 'history_geography', title: 'History & Geography', description: 'Travel back in time to test your knowledge of major historical events, figures, and civilizations.' },
    { id: 'mathematics_logic', title: 'Mathematics & Logic', description: 'Challenge your logical reasoning with problems in mathematics and abstract thinking.' },
    { id: 'world_knowledge', title: 'World Knowledge', description: 'Test your general knowledge about global geography, cultures, and current events.' },
    { id: 'islamic_knowledge', title: 'Islamic Knowledge', description: 'Deepen your understanding of Islamic history, principles, and traditions.' },
    { id: 'time_challenge', title: 'Time Challenge', description: 'A fast-paced quiz with random questions from all topics. How high can you score?', isChallenge: true },
];

export const state = {
    user: null,
    is3DMode: true,
    currentScreen: Screen.HOME,
    currentTopic: null,
    currentLevel: 1,
    userProgress: { topics: {}, stats: { totalQuizzes: 0 }, achievements: {} },
    gameMode: 'topic', // 'topic' or 'timeChallenge'
};
