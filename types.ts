export enum ModuleId {
  INTRO = 'INTRO',
  ARCH = 'ARCH',
  ACCOUNT = 'ACCOUNT',
  WAREHOUSE = 'WAREHOUSE',
  DATA_MOVEMENT = 'DATA_MOVEMENT',
  PERFORMANCE = 'PERFORMANCE',
  STORAGE = 'STORAGE',
}

export interface SubTopic {
  id: string;
  title: string;
  description: string;
  keyPoints: string[];
}

export interface Module {
  id: ModuleId;
  title: string;
  icon: string;
  description: string;
  topics: SubTopic[];
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index
  explanation: string;
}

export interface LabStep {
  step: number;
  instruction: string;
  sql?: string;
  explanation: string;
}

export interface LabScenario {
  title: string;
  description: string;
  steps: LabStep[];
}
