import React, { useState } from 'react';
import { Module, QuizQuestion } from '../types';
import { generateQuiz } from '../services/geminiService';
import { HelpCircle, CheckCircle, XCircle, RefreshCw, Loader2, Play } from 'lucide-react';

interface Props {
  module: Module;
}

const QuizView: React.FC<Props> = ({ module }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const startQuiz = async () => {
    setLoading(true);
    setShowResults(false);
    setUserAnswers({});
    const newQuestions = await generateQuiz(module.title);
    setQuestions(newQuestions);
    setLoading(false);
  };

  const handleSelectAnswer = (qId: number, optionIdx: number) => {
    if (showResults) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) correct++;
    });
    return correct;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg border border-slate-200">
        <Loader2 className="animate-spin h-10 w-10 text-snow-500 mb-4" />
        <p className="text-slate-600 font-medium">Generating Exam Questions for {module.title}...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg border border-slate-200 p-8 text-center">
        <div className="bg-snow-100 p-4 rounded-full mb-4">
          <HelpCircle className="h-12 w-12 text-snow-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Practice Quiz</h2>
        <p className="text-slate-600 max-w-md mb-6">
          Test your knowledge on {module.title}. Our AI will generate unique questions similar to the actual SnowPro Core exam.
        </p>
        <button
          onClick={startQuiz}
          className="flex items-center gap-2 px-6 py-3 bg-snow-600 text-white rounded-md hover:bg-snow-700 transition-all font-semibold shadow-md hover:shadow-lg"
        >
          <Play size={20} />
          Start Practice Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-bold text-slate-700">{module.title} Assessment</h3>
        <button
          onClick={startQuiz}
          className="text-sm text-snow-600 hover:text-snow-700 flex items-center gap-1 font-medium"
        >
          <RefreshCw size={14} /> New Questions
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {questions.map((q, idx) => (
          <div key={q.id} className="border-b border-slate-100 pb-8 last:border-0">
            <div className="flex gap-3 mb-4">
              <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-sm">
                {idx + 1}
              </span>
              <h4 className="text-lg font-medium text-slate-800 pt-1">{q.question}</h4>
            </div>

            <div className="pl-11 space-y-3">
              {q.options.map((option, optIdx) => {
                const isSelected = userAnswers[q.id] === optIdx;
                const isCorrect = q.correctAnswer === optIdx;
                
                let btnClass = "w-full text-left p-3 rounded-lg border transition-all text-sm ";
                
                if (showResults) {
                  if (isCorrect) btnClass += "bg-green-50 border-green-200 text-green-800 font-medium ";
                  else if (isSelected && !isCorrect) btnClass += "bg-red-50 border-red-200 text-red-800 ";
                  else btnClass += "bg-white border-slate-200 opacity-60 ";
                } else {
                  if (isSelected) btnClass += "bg-snow-50 border-snow-300 text-snow-800 ";
                  else btnClass += "bg-white border-slate-200 hover:border-snow-300 hover:bg-slate-50 ";
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectAnswer(q.id, optIdx)}
                    disabled={showResults}
                    className={btnClass}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showResults && isCorrect && <CheckCircle size={16} className="text-green-600" />}
                      {showResults && isSelected && !isCorrect && <XCircle size={16} className="text-red-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
            
            {showResults && (
              <div className="mt-4 ml-11 p-4 bg-slate-50 rounded-md text-sm text-slate-700 border border-slate-200">
                <span className="font-semibold text-slate-900">Explanation: </span>
                {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
        {!showResults ? (
          <button
            onClick={() => setShowResults(true)}
            disabled={Object.keys(userAnswers).length < questions.length}
            className={`w-full py-3 rounded-md font-bold text-white transition-colors ${
              Object.keys(userAnswers).length < questions.length
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-snow-600 hover:bg-snow-700 shadow-sm'
            }`}
          >
            Submit Answers
          </button>
        ) : (
          <div className="w-full flex justify-between items-center">
             <div className="text-lg font-bold text-slate-800">
               Score: <span className={calculateScore() === questions.length ? "text-green-600" : "text-snow-600"}>
                 {calculateScore()} / {questions.length}
               </span>
             </div>
             <button
                onClick={startQuiz}
                className="px-6 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-900 text-sm font-medium"
             >
                Try Another Set
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizView;
