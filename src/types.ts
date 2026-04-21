export type Screen = 'onboarding' | 'daily' | 'weekly' | 'badges' | 'chat' | 'videos' | 'profile';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  time?: string;
}

export interface QuizResult {
  date: string;
  type: 'daily' | 'weekly';
  score: number;
  maxScore: number;
  label?: string; // e.g. "Moderate"
}

export interface UserState {
  name: string;
  bio: string;
  avatar: string;
  streak: number;
  behaviouralSummary: string;
  concerns: string[];
  conversationHistory: Message[];
  quizHistory: QuizResult[];
  unlockedBadges: string[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  colorClass: string;
}

export interface VideoSnippet {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  tagName: string;
}
