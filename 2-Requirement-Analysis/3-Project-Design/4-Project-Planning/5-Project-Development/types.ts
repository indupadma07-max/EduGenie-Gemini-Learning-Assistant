export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type ActionType = 'explain' | 'summarize' | 'quiz';

export interface EduResponse {
  type: ActionType;
  topic: string;
  content?: string;
  questions?: QuizQuestion[];
  timestamp: string;
}
