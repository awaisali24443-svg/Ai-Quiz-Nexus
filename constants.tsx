
import React from 'react';
import { Topic } from './types';

const CodeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
);
const DnaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 14.5A4.5 4.5 0 0 1 8.5 10H10a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-1.5A4.5 4.5 0 0 0 4 18.5v0A4.5 4.5 0 0 0 8.5 14H10a2 2 0 0 0 2-2v0a2 2 0 0 0-2-2h-1.5A4.5 4.5 0 0 1 4 5.5v0A4.5 4.5 0 0 1 8.5 10H10a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-1.5A4.5 4.5 0 0 0 4 18.5Z"></path></svg>
);
const TelescopeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m10.065 12.493-6.18 1.815a.5.5 0 0 1-.65-.65l1.815-6.18a4 4 0 0 1 5.016-5.016l6.18-1.815a.5.5 0 0 1 .65.65l-1.815 6.18a4 4 0 0 1-5.016 5.016z"></path><path d="m18 12 1-1"></path><path d="M12 6 8 2"></path><path d="m19 19-3.5-3.5"></path><path d="m12.493 10.065 2.442 2.442"></path></svg>
);
const BotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
);
const BriefcaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
);
const BrushIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"></path><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"></path></svg>
);
const HeartPulseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path><path d="M3.22 12H9.5l.7-1.5L11.5 14l1.8-3 2 3h4.8"></path></svg>
);
const LeafIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 20A7 7 0 0 1 4 13V8a5 5 0 0 1 10 0v5a7 7 0 0 1-7 7Zm0 0v0a7 7 0 0 0 7-7V8a5 5 0 0 0-10 0v5a7 7 0 0 0 7 7Z"></path><path d="M11 20v-5"></path></svg>
);
const BrainCircuitIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2a2.5 2.5 0 0 1 2.5 2.5v.75a2.5 2.5 0 0 1-5 0V4.5A2.5 2.5 0 0 1 12 2Z"></path><path d="M12 13.5a2.5 2.5 0 0 1 2.5 2.5v.75a2.5 2.5 0 0 1-5 0v-.75a2.5 2.5 0 0 1 2.5-2.5Z"></path><path d="M5 11.5a2.5 2.5 0 0 1 2.5 2.5v.75a2.5 2.5 0 0 1-5 0v-.75A2.5 2.5 0 0 1 5 11.5Z"></path><path d="M19 11.5a2.5 2.5 0 0 1 2.5 2.5v.75a2.5 2.5 0 0 1-5 0v-.75a2.5 2.5 0 0 1 2.5-2.5Z"></path><path d="M12 22a2.5 2.5 0 0 1-2.5-2.5V18a2.5 2.5 0 0 1 5 0v1.5a2.5 2.5 0 0 1-2.5 2.5Z"></path><path d="M15.5 4.75a.75.75 0 0 0 1.5 0"></path><path d="M19 8a.75.75 0 0 0 1.5 0"></path><path d="M3.5 8a.75.75 0 0 0 1.5 0"></path><path d="M7 4.75a.75.75 0 0 0 1.5 0"></path><path d="M12 11.5V9"></path><path d="M12 17v-1.5"></path><path d="m16.5 13-1-1"></path><path d="m8.5 13 1-1"></path><path d="m4.5 15.5-1-1"></path><path d="m19.5 15.5 1-1"></path><path d="M18 6.5 16 8"></path><path d="m6 6.5 2 1.5"></path></svg>
);

export const TOPICS: Topic[] = [
  { id: 'prog_ai', title: 'Programming & AI', description: 'Dive into algorithms, machine learning, and advanced coding concepts. Test your knowledge in Python, C++, and AI frameworks.', image: 'https://picsum.photos/seed/prog_ai/400/200', icon: CodeIcon },
  { id: 'bio_gen', title: 'Biology & Genetics', description: 'Explore the mysteries of life, from cellular structures to advanced genetic engineering and ecosystems. Test your biological insights.', image: 'https://picsum.photos/seed/bio_gen/400/200', icon: DnaIcon },
  { id: 'cos_space', title: 'Cosmology & Space', description: 'Journey through the cosmos, studying black holes, distant galaxies, and the origins of the universe. Explore cosmic phenomena.', image: 'https://picsum.photos/seed/cos_space/400/200', icon: TelescopeIcon },
  { id: 'robo_auto', title: 'Robotics & Automation', description: 'Delve into the world of smart machines, automation principles, and future technological advancements. Design and control robotic systems.', image: 'https://picsum.photos/seed/robo_auto/400/200', icon: BotIcon },
  { id: 'biz_fin', title: 'Business & Finance', description: 'Master economic theories, market trends, and strategic business management. Analyze financial data and investment strategies.', image: 'https://picsum.photos/seed/biz_fin/400/200', icon: BriefcaseIcon },
  { id: 'art_culture', title: 'Arts & Culture', description: 'Explore art history, diverse cultural movements, and creative expressions across different civilizations. Uncover artistic legacies.', image: 'https://picsum.photos/seed/art_culture/400/200', icon: BrushIcon },
  { id: 'med_health', title: 'Medicine & Health', description: 'Understand human anatomy, physiology, and modern medical practices. Explore diseases, treatments, and public health initiatives.', image: 'https://picsum.photos/seed/med_health/400/200', icon: HeartPulseIcon },
  { id: 'env_eco', title: 'Environment & Ecology', description: 'Learn about environmental science, climate change, and sustainable practices. Protect our planet and its biodiversity.', image: 'https://picsum.photos/seed/env_eco/400/200', icon: LeafIcon },
  { id: 'logic_phil', title: 'Logic & Philosophy', description: 'Challenge your mind with logical puzzles, critical thinking, and philosophical debates. Understand fundamental questions.', image: 'https://picsum.photos/seed/logic_phil/400/200', icon: BrainCircuitIcon },
];

export const TOTAL_LEVELS = 30;
export const QUESTIONS_PER_QUIZ = 10;
export const TIMER_SECONDS_PER_QUESTION = 50;
export const SCORE_TO_UNLOCK_NEXT_LEVEL = 5;
