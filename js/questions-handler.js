import { TOPICS } from './state.js';
import { QUIZ_DATA } from './questions.js';

export function getFallbackQuestions(topicTitle, level) {
    const topic = TOPICS.find(t => t.title === topicTitle);
    const topicId = topic ? topic.id : topicTitle.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_');
    if (!topic || !QUIZ_DATA || !QUIZ_DATA[topicId]) {
        console.error(`No fallback questions available for topic: ${topicTitle}`);
        throw new Error('Failed to load quiz questions for this topic. Please try again later.');
    }

    const topicData = QUIZ_DATA[topicId];
    let fallbackLevelKey;

    if (level <= 10) fallbackLevelKey = 'level_1';
    else if (level <= 20) fallbackLevelKey = 'level_11';
    else fallbackLevelKey = 'level_21';
    
    if (topicData[`level_${level}`]) fallbackLevelKey = `level_${level}`;

    let fallbackSet = topicData[fallbackLevelKey];
    if (!fallbackSet || fallbackSet.length === 0) {
        fallbackSet = topicData['level_1'] || [];
    }
    if (fallbackSet.length === 0) throw new Error('No fallback questions found.');

    const shuffled = [...fallbackSet].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
}