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
  detailSections?: DetailSection[];
  officialLinks?: OfficialLink[];
  lab?: Lab;
};

export type DetailSection = {
  title: string;
  body: string;
  bullets?: string[];
};

export type OfficialLink = {
  title: string;
  url: string;
};

export type LabStep = {
  title: string;
  instruction: string;
  sql?: string;
  hint: string;
  verify: string;
};

export type Lab = {
  title: string;
  objective: string;
  prerequisites: string[];
  editionNote?: string;
  steps: LabStep[];
  cleanup?: string;
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

export type BankQuestion = {
  id: string;
  number: number;
  sourcePage: number;
  domainId: string;
  prompt: string;
  options: string[];
  correctAnswers: number[];
  answerLabels: string[];
  explanation: string;
  source: string;
};

export type ViewMode = 'plan' | 'learn' | 'quiz' | 'bank';
