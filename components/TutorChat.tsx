'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Message } from '@/lib/types';
import { MessageSquare, Send, X, Bot, User } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import ErrorDisplay from './ErrorDisplay';
import LoadingSpinner from './LoadingSpinner';
import RetryButton from './RetryButton';

const TutorChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! I'm your SnowPro Core AI Tutor. Ask me anything about the exam!", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    const history = messages.map(m => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.text }]
    }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history,
          message: input,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [...prev, { role: 'model', text: data.response, timestamp: Date.now() }]);
        setRetryCount(0);
      } else {
        const errorMsg = data.error || "I'm having trouble connecting to the AI service. Please check your configuration.";
        setError(errorMsg);
        setRetryCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = error instanceof Error ? error.message : "I'm having trouble connecting right now.";
      setError(errorMsg);
      setRetryCount(prev => prev + 1);
    }
    
    setLoading(false);
  };

  const handleRetry = () => {
    setError(null);
    handleSend();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 bg-snow-600 hover:bg-snow-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 z-50"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col z-50 animate-fade-in-up">
      <div className="p-4 bg-snow-600 text-white rounded-t-xl flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
            <Bot size={20} />
            <span className="font-bold">AI Tutor</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-snow-700 p-1 rounded transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-snow-100 flex items-center justify-center flex-shrink-0 border border-snow-200">
                    <Bot size={14} className="text-snow-600" />
                </div>
            )}
            <div className={`max-w-[80%] rounded-lg p-3 text-sm shadow-sm ${
              m.role === 'user' 
                ? 'bg-snow-600 text-white' 
                : 'bg-white text-slate-800 border border-slate-200'
            }`}>
              {m.role === 'model' ? <MarkdownRenderer content={m.text} /> : m.text}
            </div>
            {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-slate-600" />
                </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start gap-2">
            <div className="w-8 h-8 rounded-full bg-snow-100 flex items-center justify-center flex-shrink-0 border border-snow-200">
              <Bot size={14} className="text-snow-600" />
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <LoadingSpinner size="sm" text="Thinking..." />
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex justify-start gap-2">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 border border-red-200">
              <Bot size={14} className="text-red-600" />
            </div>
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <ErrorDisplay 
                error={error} 
                type="auth"
                retry={handleRetry}
                className="max-w-[250px]"
              />
              <RetryButton 
                onRetry={handleRetry}
                loading={loading}
                maxRetries={3}
                retryCount={retryCount}
                error={error}
                className="m-3"
              />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t border-slate-200 rounded-b-xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about Micro-partitions..."
            className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-snow-500 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-snow-600 text-white p-2 rounded-md hover:bg-snow-700 disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorChat;
