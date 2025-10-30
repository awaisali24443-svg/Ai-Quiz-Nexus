
import { GoogleGenAI, Type } from '@google/genai';
import { QuizQuestion } from '../types';

// FIX: Per Gemini API guidelines, the API key must be read directly from process.env.API_KEY
// and not have any fallback or warning logic.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const quizQuestionSchema = {
    type: Type.OBJECT,
    properties: {
        question: { type: Type.STRING },
        options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
        },
        correctAnswerIndex: { type: Type.INTEGER },
    },
    required: ['question', 'options', 'correctAnswerIndex'],
};

export const generateQuizQuestions = async (topic: string, level: number): Promise<QuizQuestion[]> => {
  try {
    const prompt = `Generate a quiz with 10 multiple-choice questions for the topic: "${topic}". The difficulty should be appropriate for level ${level} out of 30, where 1 is easy and 30 is expert. Each question must have exactly 4 options.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    questions: {
                        type: Type.ARRAY,
                        items: quizQuestionSchema,
                    },
                },
                required: ['questions'],
            },
        },
    });

    const jsonString = response.text;
    const result = JSON.parse(jsonString);

    if (result.questions && Array.isArray(result.questions)) {
      return result.questions;
    } else {
      throw new Error("Invalid response format from Gemini API");
    }
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    // Fallback to mock data if API fails
    return Promise.resolve([
        { question: `Mock Question about ${topic}?`, options: ['A', 'B', 'C', 'D'], correctAnswerIndex: 0 },
        { question: 'Another Mock Question?', options: ['A', 'B', 'C', 'D'], correctAnswerIndex: 1 },
    ]);
  }
};

export const generateAiFeedback = async (topic: string, score: number, totalQuestions: number): Promise<string> => {
    try {
        const prompt = `You are an encouraging AI learning coach. A user has just completed a quiz on the topic "${topic}". They scored ${score} out of ${totalQuestions}. Provide a brief, positive, and constructive feedback message (2-3 sentences) to encourage them.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        return response.text;
    } catch (error) {
        console.error("Error generating AI feedback:", error);
        return "Great effort! Keep practicing to master the topic.";
    }
};
