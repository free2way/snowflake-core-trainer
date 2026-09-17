import type { LucideIcon } from 'lucide-react';

export type Topic = {
  id: string;
  title: string;
  kicker: string;
  summary: string;
  minutes: number;
  objectives: string[];
  examNotes: string[];
  trap: string;
  practice?: { title: string; sql: string; note: string };
};

export type Domain = {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
  weight: number;
  icon?: LucideIcon;
  description: string;
  topics: Topic[];
};

export type QuizQuestion = {
  id: string;
  domainId: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  reference: string;
};

export type ViewMode = 'plan' | 'learn' | 'quiz';
