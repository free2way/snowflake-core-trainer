import React, { useState } from 'react';
import { CURRICULUM } from './constants';
import { Module } from './types';
import ModuleView from './components/ModuleView';
import QuizView from './components/QuizView';
import LabView from './components/LabView';
import TutorChat from './components/TutorChat';
import * as Icons from 'lucide-react';

// Icon mapper
const IconComponent = ({ name, className }: { name: string; className?: string }) => {
  // @ts-ignore
  const Icon = Icons[name] || Icons.HelpCircle;
  return <Icon className={className} />;
};

type ViewMode = 'learn' | 'lab' | 'quiz';

const App: React.FC = () => {
  const [activeModuleId, setActiveModuleId] = useState(CURRICULUM[0].id);
  const [viewMode, setViewMode] = useState<ViewMode>('learn');

  const activeModule = CURRICULUM.find(m => m.id === activeModuleId)!;

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-snow-500 p-1.5 rounded-lg">
            <Icons.Snowflake className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight">CoreTrainer</h1>
            <p className="text-xs text-slate-500">SnowPro Cert Prep</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Curriculum Modules
          </div>
          {CURRICULUM.map(module => (
            <button
              key={module.id}
              onClick={() => {
                setActiveModuleId(module.id);
                setViewMode('learn');
              }}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors border-l-4 ${
                activeModuleId === module.id
                  ? 'bg-slate-800 text-snow-400 border-snow-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800 border-transparent'
              }`}
            >
              <IconComponent name={module.icon} className="h-4 w-4" />
              {module.title}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-600 text-center">
            v1.0.0 • AI Powered
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Bar for View Switching */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{activeModule.title}</h2>
            <p className="text-sm text-slate-500">Domain Coverage: {activeModule.id}</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('learn')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'learn' ? 'bg-white text-snow-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icons.BookOpen size={16} /> Learn
            </button>
            <button
              onClick={() => setViewMode('lab')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'lab' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icons.Terminal size={16} /> Lab
            </button>
            <button
              onClick={() => setViewMode('quiz')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'quiz' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icons.CheckSquare size={16} /> Quiz
            </button>
          </div>
        </header>

        {/* Workspace */}
        <main className="flex-1 p-6 overflow-hidden">
          {viewMode === 'learn' && <ModuleView module={activeModule} />}
          {viewMode === 'lab' && <LabView module={activeModule} />}
          {viewMode === 'quiz' && <QuizView module={activeModule} />}
        </main>
      </div>

      {/* Global Components */}
      <TutorChat />
    </div>
  );
};

export default App;
