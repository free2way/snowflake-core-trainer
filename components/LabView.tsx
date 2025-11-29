import React, { useState } from 'react';
import { Module, LabScenario } from '../types';
import { generateLab } from '../services/geminiService';
import { Terminal, ChevronRight, Play, Loader2, Copy } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface Props {
  module: Module;
}

const LabView: React.FC<Props> = ({ module }) => {
  const [lab, setLab] = useState<LabScenario | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const startLab = async () => {
    setLoading(true);
    setCurrentStep(0);
    const newLab = await generateLab(module.title);
    setLab(newLab);
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast here
  };

  if (loading) {
     return (
      <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg border border-slate-200">
        <Loader2 className="animate-spin h-10 w-10 text-emerald-500 mb-4" />
        <p className="text-slate-600 font-medium">Preparing Lab Environment for {module.title}...</p>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg border border-slate-200 p-8 text-center">
        <div className="bg-emerald-50 p-4 rounded-full mb-4">
          <Terminal className="h-12 w-12 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Hands-on Lab</h2>
        <p className="text-slate-600 max-w-md mb-6">
          Practice makes perfect. Generate a step-by-step SQL lab guide tailored to {module.title}.
        </p>
        <button
          onClick={startLab}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-all font-semibold shadow-md"
        >
          <Play size={20} />
          Generate Lab Scenario
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Terminal className="text-emerald-600" size={20} />
                {lab.title}
                </h2>
                <p className="text-slate-600 mt-1 text-sm">{lab.description}</p>
            </div>
            <button onClick={startLab} className="text-xs text-slate-500 underline hover:text-emerald-600">New Scenario</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Step List */}
        <div className="w-1/4 bg-slate-50 border-r border-slate-200 overflow-y-auto">
          {lab.steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`w-full text-left p-4 border-b border-slate-100 transition-colors flex items-start gap-3 ${
                currentStep === idx ? 'bg-white border-l-4 border-l-emerald-500' : 'hover:bg-slate-100 border-l-4 border-l-transparent'
              }`}
            >
              <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep === idx ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
              }`}>
                {step.step}
              </span>
              <span className={`text-sm font-medium ${currentStep === idx ? 'text-slate-900' : 'text-slate-500'}`}>
                Step {step.step}
              </span>
            </button>
          ))}
        </div>

        {/* Step Detail */}
        <div className="w-3/4 p-8 overflow-y-auto bg-white">
          <div className="max-w-3xl mx-auto">
             <div className="mb-6 flex items-center gap-2 text-sm text-slate-400 font-mono uppercase tracking-widest">
                Step {lab.steps[currentStep].step} of {lab.steps.length}
             </div>
             
             <h3 className="text-xl font-bold text-slate-900 mb-4">
                {lab.steps[currentStep].instruction}
             </h3>
             
             <div className="prose prose-sm prose-slate max-w-none mb-6">
                <p>{lab.steps[currentStep].explanation}</p>
             </div>

             {lab.steps[currentStep].sql && (
               <div className="mt-6">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">SQL Command</span>
                    <button 
                        onClick={() => copyToClipboard(lab.steps[currentStep].sql || '')}
                        className="text-xs flex items-center gap-1 text-emerald-600 hover:text-emerald-700"
                    >
                        <Copy size={12} /> Copy
                    </button>
                 </div>
                 <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto shadow-inner relative group">
                    <pre className="text-emerald-300 font-mono text-sm code-scroll">
                        {lab.steps[currentStep].sql}
                    </pre>
                 </div>
               </div>
             )}

             <div className="mt-12 flex justify-between">
                <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="px-4 py-2 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 text-sm font-medium"
                >
                    Previous
                </button>
                <button
                    onClick={() => setCurrentStep(Math.min(lab.steps.length - 1, currentStep + 1))}
                    disabled={currentStep === lab.steps.length - 1}
                    className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2 shadow-sm"
                >
                    Next Step <ChevronRight size={16} />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabView;
