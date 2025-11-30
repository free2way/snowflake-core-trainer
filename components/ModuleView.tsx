'use client';

import React, { useState } from 'react';
import { Module } from '@/lib/types';
import { Lightbulb, CheckCircle } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface ModuleViewProps {
  module: Module;
}

const ModuleView: React.FC<ModuleViewProps> = ({ module }) => {
  const [selectedTopicId, setSelectedTopicId] = useState(module.topics[0].id);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [loadingExplanations, setLoadingExplanations] = useState<Record<string, boolean>>({});
  const [showAIExplanation, setShowAIExplanation] = useState<Record<string, boolean>>({});

  const selectedTopic = module.topics.find(t => t.id === selectedTopicId);
  
  // Handle case where no topic is found
  if (!selectedTopic) {
    return (
      <div className="flex h-full gap-6">
        <div className="w-80 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">Topics</h3>
            <p className="text-sm text-slate-500">{module.topics.length} topics</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {module.topics.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                No topics available
              </div>
            ) : (
              module.topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopicId(topic.id)}
                  className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                    selectedTopicId === topic.id ? 'bg-slate-50 border-l-4 border-l-snow-500' : ''
                  }`}
                >
                  <div className="font-medium text-slate-800">{topic.title}</div>
                  <div className="text-sm text-slate-500 mt-1">{topic.description}</div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">No Topic Selected</h2>
                <p className="text-slate-600 mt-1">Please select a topic from the left to begin learning.</p>
              </div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(100vh-280px)]">
            <div className="text-center text-slate-500 py-12">
              Select a topic to view its content
            </div>
          </div>
        </div>
      </div>
    );
  }

  const generateExplanation = async (topicTitle: string, topicId: string) => {
    setLoadingExplanations(prev => ({ ...prev, [topicId]: true }));
    
    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topicTitle,
          context: module.title,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setExplanations(prev => ({ ...prev, [topicId]: data.explanation }));
      } else {
        console.error('Failed to generate explanation:', data.error);
      }
    } catch (error) {
      console.error('Error generating explanation:', error);
    } finally {
      setLoadingExplanations(prev => ({ ...prev, [topicId]: false }));
    }
  };

  const toggleAIExplanation = (topicId: string, topicTitle: string) => {
    const isShowing = showAIExplanation[topicId];
    if (!isShowing && !explanations[topicId]) {
      // 第一次显示时生成解释
      generateExplanation(topicTitle, topicId);
    }
    setShowAIExplanation(prev => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  return (
    <div className="flex h-full gap-6">
      {/* 主题列表 */}
      <div className="w-80 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Topics</h3>
          <p className="text-sm text-slate-500">{module.topics.length} topics</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {module.topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopicId(topic.id)}
              className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                selectedTopicId === topic.id ? 'bg-slate-50 border-l-4 border-l-snow-500' : ''
              }`}
            >
              <div className="font-medium text-slate-800">{topic.title}</div>
              <div className="text-sm text-slate-500 mt-1">{topic.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{selectedTopic.title}</h2>
              <p className="text-slate-600 mt-1">{selectedTopic.description}</p>
            </div>
            
            <button
              onClick={() => toggleAIExplanation(selectedTopic.id, selectedTopic.title)}
              disabled={loadingExplanations[selectedTopic.id]}
              className="bg-snow-600 hover:bg-snow-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Lightbulb size={16} />
              {loadingExplanations[selectedTopic.id] ? 'Generating...' : 
               showAIExplanation[selectedTopic.id] ? 'Hide AI Explanation' : 'Ask AI Tutor'}
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(100vh-280px)]">
          <div className="space-y-6">
            {/* 关键要点 */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Key Points</h3>
              <div className="space-y-3">
                {selectedTopic.keyPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI 解释 */}
            {showAIExplanation[selectedTopic.id] && (
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">AI Tutor Explanation</h3>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  {loadingExplanations[selectedTopic.id] ? (
                    <div className="flex items-center gap-2 text-slate-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-snow-600"></div>
                      Generating explanation...
                    </div>
                  ) : explanations[selectedTopic.id] ? (
                    <MarkdownRenderer content={explanations[selectedTopic.id]} />
                  ) : (
                    <p className="text-slate-500">Failed to generate explanation. Please try again.</p>
                  )}
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
