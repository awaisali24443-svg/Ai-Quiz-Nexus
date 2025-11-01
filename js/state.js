
export const TOTAL_LEVELS = 30;
export const SCORE_TO_UNLOCK_NEXT_LEVEL = 7;

export const Screen = {
    HOME: 'home-screen',
    LEVEL: 'level-screen',
    QUIZ: 'quiz-screen',
    RESULTS: 'results-screen',
};

export const TOPICS = [
    { id: 'programming', title: 'Programming Languages', description: 'Test your knowledge in syntax, algorithms, and data structures across various languages.' },
    { id: 'technology_ai', title: 'AI & Technology', description: 'Explore concepts of machine learning, neural networks, and modern tech innovations.' },
    { id: 'space_astronomy', title: 'Space & Astronomy', description: 'Journey through the cosmos, from planets and stars to galaxies and black holes.' },
    { id: 'biology', title: 'Chemistry', description: 'Delve into the world of atoms, molecules, reactions, and the periodic table.' },
    { id: 'science_inventions', title: 'Physics', description: 'Challenge your understanding of motion, energy, forces, and the fundamental laws of the universe.' },
    { id: 'world_knowledge', title: 'World Knowledge', description: 'Test your general knowledge about global geography, cultures, and current events.' },
    { id: 'history_geography', title: 'History', description: 'Travel back in time and test your knowledge of major historical events, figures, and civilizations.' },
    { id: 'science_inventions', title: 'Science Inventions', description: 'Learn about the groundbreaking inventions and discoveries that shaped our world.' },
    { id: 'biology', title: 'Biology', description: 'Explore the mysteries of life, from cellular structures to complex ecosystems.' },
    { id: 'space_astronomy', title: 'Time Challenge', description: 'A fast-paced quiz with random questions from all topics. How high can you score?', isChallenge: true },
];

export const state = {
    user: null,
    is3DMode: true,
    currentScreen: Screen.HOME,
    currentTopic: null,
    currentLevel: 1,
    userProgress: { topics: {} },
    gameMode: 'topic',
};
