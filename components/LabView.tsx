'use client';

import React, { useState, useEffect } from 'react';
import { Module, LabScenario } from '@/lib/types';
import { PlayCircle, CheckCircle, Terminal, RotateCcw } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface LabViewProps {
  module: Module;
}

const LabView: React.FC<LabViewProps> = ({ module }) => {
  const [labScenario, setLabScenario] = useState<LabScenario | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [labLoaded, setLabLoaded] = useState(false);

  const generateLab = async () => {
    setLoading(true);
    setCurrentStep(0);
    setCompletedSteps(new Set());
    
    try {
      const response = await fetch('/api/lab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleTitle: module.title,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setLabScenario(data.labScenario);
        setLabLoaded(true);
      } else {
        console.error('Failed to generate lab:', data.error);
      }
    } catch (error) {
      console.error('Error generating lab:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetLab = () => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    generateLab();
  };

  const completeStep = (stepNumber: number) => {
    setCompletedSteps(prev => new Set([...prev, stepNumber]));
    if (stepNumber === currentStep && labScenario && stepNumber < labScenario.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToStep = (stepNumber: number) => {
    setCurrentStep(stepNumber);
  };

  // 页面加载时自动生成实验
  useEffect(() => {
    if (!labLoaded) {
      generateLab();
    }
  }, [module.id]);

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Hands-on Lab</h2>
          <p className="text-slate-600">Practice with {module.title}</p>
        </div>
        
        <button
          onClick={resetLab}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RotateCcw size={16} />
          {loading ? 'Generating...' : 'New Lab'}
        </button>
      </div>

      {/* 实验内容 */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-slate-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
              Generating lab scenario...
            </div>
          </div>
        )}

        {!loading && !labScenario && (
          <div className="flex items-center justify-center h-64 text-slate-500">
            <div className="text-center">
              <p>Failed to generate lab scenario.</p>
              <button
                onClick={generateLab}
                className="mt-3 text-emerald-600 hover:text-emerald-700 underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {!loading && labScenario && (
          <div className="space-y-6">
            {/* 实验概览 */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 text-emerald-700 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <Terminal size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{labScenario.title}</h3>
                  <p className="text-slate-600 mb-4">{labScenario.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <CheckCircle size={16} />
                      <span>{completedSteps.size}/{labScenario.steps.length} steps completed</span>
                    </div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                    <span>Progress: {Math.round((completedSteps.size / labScenario.steps.length) * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 实验步骤 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 步骤列表 */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <h4 className="font-semibold text-slate-800">Steps</h4>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {labScenario.steps.map((step, index) => (
                      <button
                        key={step.step}
                        onClick={() => goToStep(index)}
                        className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                          currentStep === index ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                            completedSteps.has(step.step)
                              ? 'bg-green-500 text-white'
                              : currentStep === index
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {completedSteps.has(step.step) ? '✓' : step.step}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-slate-800">Step {step.step}</div>
                            <div className="text-sm text-slate-500 line-clamp-1">{step.instruction}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 步骤详情 */}
              <div className="lg:col-span-2">
                {labScenario.steps[currentStep] && (
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-emerald-100 text-emerald-700 rounded-full w-10 h-10 flex items-center justify-center font-semibold">
                        {labScenario.steps[currentStep].step}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-slate-800">
                          Step {labScenario.steps[currentStep].step}
                        </h4>
                        <p className="text-slate-600">{labScenario.steps[currentStep].instruction}</p>
                      </div>
                    </div>

                    {/* SQL 代码 */}
                    {labScenario.steps[currentStep].sql && (
                      <div className="mb-6">
                        <h5 className="font-semibold text-slate-800 mb-2">SQL Command:</h5>
                        <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                          <pre>{labScenario.steps[currentStep].sql}</pre>
                        </div>
                      </div>
                    )}

                    {/* 解释 */}
                    <div className="mb-6">
                      <h5 className="font-semibold text-slate-800 mb-2">Explanation:</h5>
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <MarkdownRenderer content={labScenario.steps[currentStep].explanation} />
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                        disabled={currentStep === 0}
                        className="px-4 py-2 text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ← Previous Step
                      </button>

                      <div className="flex gap-3">
                        {!completedSteps.has(labScenario.steps[currentStep].step) && (
                          <button
                            onClick={() => completeStep(labScenario.steps[currentStep].step)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                          >
                            <CheckCircle size={16} />
                            Mark as Complete
                          </button>
                        )}

                        {currentStep < labScenario.steps.length - 1 && (
                          <button
                            onClick={() => setCurrentStep(prev => prev + 1)}
                            className="bg-snow-600 hover:bg-snow-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                          >
                            <PlayCircle size={16} />
                            Next Step
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabView;
