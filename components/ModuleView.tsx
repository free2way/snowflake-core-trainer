import React, { useState } from 'react';
import { Module, SubTopic } from '../types';
import { generateExplanation } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';
import { BookOpen, Sparkles, Loader2 } from 'lucide-react';

interface Props {
  module: Module;
}

const ModuleView: React.FC<Props> = ({ module }) => {
  const [activeTopic, setActiveTopic] = useState<SubTopic>(module.topics[0]);
  const [aiContent, setAiContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDeepDive = async () => {
    setLoading(true);
    const content = await generateExplanation(activeTopic.title, module.title);
    setAiContent(content);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="text-snow-600" />
          {module.title}
        </h2>
        <p className="text-slate-600 mt-1">{module.description}</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Topics Sidebar */}
        <div className="w-1/3 bg-slate-50 border-r border-slate-200 p-4 overflow-y-auto">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Topics</h3>
          <div className="space-y-2">
            {module.topics.map(topic => (
              <button
                key={topic.id}
                onClick={() => {
                    setActiveTopic(topic);
                    setAiContent(null);
                }}
                className={`w-full text-left p-3 rounded-md text-sm transition-colors ${
                  activeTopic.id === topic.id
                    ? 'bg-white text-snow-700 shadow-sm border border-snow-200 font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {topic.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="w-2/3 p-6 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-800 mb-2">{activeTopic.title}</h3>
            <p className="text-slate-600 mb-4">{activeTopic.description}</p>
            
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-yellow-800 mb-2 text-sm">Key Exam Points:</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-700 text-sm">
                {activeTopic.keyPoints.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            {!aiContent && !loading && (
              <div className="text-center py-10">
                <p className="text-slate-500 mb-4">Want a deeper technical explanation?</p>
                <button
                  onClick={handleDeepDive}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-snow-600 text-white rounded-md hover:bg-snow-700 transition-colors shadow-sm font-medium"
                >
                  <Sparkles size={18} />
                  Generate AI Deep Dive
                </button>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-12 text-snow-600">
                <Loader2 className="animate-spin h-8 w-8 mb-2" />
                <span className="text-sm">Consulting the Knowledge Base...</span>
              </div>
            )}

            {aiContent && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-500" />
                    AI Explanation
                  </h4>
                  <button onClick={() => setAiContent(null)} className="text-xs text-slate-400 hover:text-slate-600">
                    Clear
                  </button>
                </div>
                <div className="prose prose-sm max-w-none prose-slate">
                  <MarkdownRenderer content={aiContent} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleView;
