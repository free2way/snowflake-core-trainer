'use client';

import React, { useState, useEffect } from 'react';
import { Module, QuizQuestion } from '@/lib/types';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface QuizViewProps {
  module: Module;
}

const QuizView: React.FC<QuizViewProps> = ({ module }) => {
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/quiz', {
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
        setQuizQuestions(data.quizQuestions);
        setQuestionsLoaded(true);
        setUserAnswers({});
        setShowResults({});
      } else {
        console.error('Failed to generate quiz:', data.error);
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
    setShowResults(prev => ({ ...prev, [questionId]: true }));
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setShowResults({});
    generateQuiz();
  };

  const getScore = () => {
    if (quizQuestions.length === 0) return 0;
    let correct = 0;
    quizQuestions.forEach(question => {
      if (userAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / quizQuestions.length) * 100);
  };

  // 页面加载时自动生成测验
  useEffect(() => {
    if (!questionsLoaded) {
      generateQuiz();
    }
  }, [module.id]);

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Practice Quiz</h2>
          <p className="text-slate-600">Test your knowledge of {module.title}</p>
        </div>
        
        <div className="flex gap-3">
          {questionsLoaded && (
            <div className="text-right">
              <div className="text-sm text-slate-500">Score</div>
              <div className="text-2xl font-bold text-slate-800">{getScore()}%</div>
            </div>
          )}
          
          <button
            onClick={resetQuiz}
            disabled={loading}
            className="bg-snow-600 hover:bg-snow-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RotateCcw size={16} />
            {loading ? 'Generating...' : 'New Quiz'}
          </button>
        </div>
      </div>

      {/* 测验内容 */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-slate-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-snow-600"></div>
              Generating quiz questions...
            </div>
          </div>
        )}

        {!loading && quizQuestions.length === 0 && (
          <div className="flex items-center justify-center h-64 text-slate-500">
            <div className="text-center">
              <p>Failed to generate quiz questions.</p>
              <button
                onClick={generateQuiz}
                className="mt-3 text-snow-600 hover:text-snow-700 underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {!loading && quizQuestions.length > 0 && (
          <div className="space-y-6">
            {quizQuestions.map((question, index) => (
              <div key={question.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-snow-100 text-snow-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-medium text-slate-800 flex-1">
                    {question.question}
                  </h3>
                </div>

                <div className="space-y-3 ml-12">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = userAnswers[question.id] === optionIndex;
                    const isCorrect = optionIndex === question.correctAnswer;
                    const showResult = showResults[question.id];
                    
                    let buttonClass = 'w-full text-left p-3 rounded-lg border transition-all ';
                    
                    if (!showResult) {
                      buttonClass += isSelected 
                        ? 'bg-snow-50 border-snow-500 text-snow-800' 
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50';
                    } else {
                      if (isCorrect) {
                        buttonClass += 'bg-green-50 border-green-500 text-green-800';
                      } else if (isSelected && !isCorrect) {
                        buttonClass += 'bg-red-50 border-red-500 text-red-800';
                      } else {
                        buttonClass += 'bg-slate-50 border-slate-200 text-slate-500';
                      }
                    }

                    return (
                      <button
                        key={optionIndex}
                        onClick={() => !showResult && handleAnswerSelect(question.id, optionIndex)}
                        disabled={showResult}
                        className={buttonClass}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          <span>{option}</span>
                          {showResult && (
                            <div className="ml-auto">
                              {isCorrect ? (
                                <CheckCircle size={16} className="text-green-600" />
                              ) : isSelected ? (
                                <XCircle size={16} className="text-red-600" />
                              ) : null}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {showResults[question.id] && (
                  <div className="mt-4 ml-12 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-2">Explanation:</h4>
                    <MarkdownRenderer content={question.explanation} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizView;
