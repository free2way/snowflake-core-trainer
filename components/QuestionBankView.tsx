'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Bookmark, Check, CheckCircle2, ChevronRight,
  Filter, ListChecks, Search, XCircle,
} from 'lucide-react';
import { DOMAINS } from '@/lib/content';
import questionsJson from '@/lib/question-bank.generated.json';
import type { BankQuestion } from '@/lib/types';

const QUESTIONS = questionsJson as BankQuestion[];
const STORAGE_KEY = 'snowpath-question-bank-v1';
type QuestionStatus = 'all' | 'unanswered' | 'wrong' | 'favorite';
type SavedState = { answers: Record<string, number[]>; favorites: string[] };

function sameAnswers(left: number[], right: number[]) {
  if (left.length !== right.length) return false;
  const expected = new Set(right);
  return left.every((item) => expected.has(item));
}

export default function QuestionBankView() {
  const [activeId, setActiveId] = useState(QUESTIONS[0].id);
  const [domainId, setDomainId] = useState('all');
  const [status, setStatus] = useState<QuestionStatus>('all');
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as SavedState;
      setAnswers(parsed.answers || {});
      setFavorites(parsed.favorites || []);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function persist(nextAnswers: Record<string, number[]>, nextFavorites = favorites) {
    setAnswers(nextAnswers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers: nextAnswers, favorites: nextFavorites }));
  }

  function persistFavorites(nextFavorites: string[]) {
    setFavorites(nextFavorites);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, favorites: nextFavorites }));
  }

  const filtered = useMemo(() => QUESTIONS.filter((question) => {
    if (domainId !== 'all' && question.domainId !== domainId) return false;
    const saved = answers[question.id];
    if (status === 'unanswered' && saved) return false;
    if (status === 'wrong' && (!saved || sameAnswers(saved, question.correctAnswers))) return false;
    if (status === 'favorite' && !favorites.includes(question.id)) return false;
    if (deferredQuery && !`${question.number} ${question.prompt} ${question.options.join(' ')}`.toLowerCase().includes(deferredQuery)) return false;
    return true;
  }), [answers, deferredQuery, domainId, favorites, status]);

  const question = QUESTIONS.find((item) => item.id === activeId) || filtered[0] || QUESTIONS[0];
  const savedAnswer = answers[question.id];
  const revealed = Boolean(savedAnswer);
  const isMulti = question.correctAnswers.length > 1;
  const domain = DOMAINS.find((item) => item.id === question.domainId) || DOMAINS[0];
  const correctCount = useMemo(() => QUESTIONS.filter((item) => answers[item.id] && sameAnswers(answers[item.id], item.correctAnswers)).length, [answers]);
  const attempted = Object.keys(answers).length;
  const filteredIndex = filtered.findIndex((item) => item.id === question.id);

  useEffect(() => {
    if (filtered.length && !filtered.some((item) => item.id === activeId)) {
      setActiveId(filtered[0].id);
      setDraft([]);
    }
  }, [activeId, filtered]);

  function choose(optionIndex: number) {
    if (revealed) return;
    if (!isMulti) {
      persist({ ...answers, [question.id]: [optionIndex] });
      return;
    }
    setDraft((current) => current.includes(optionIndex)
      ? current.filter((item) => item !== optionIndex)
      : [...current, optionIndex]);
  }

  function submitMulti() {
    if (!draft.length) return;
    persist({ ...answers, [question.id]: draft });
  }

  function selectQuestion(id: string) {
    setActiveId(id);
    setDraft([]);
  }

  function move(direction: number) {
    const next = filtered[filteredIndex + direction];
    if (next) selectQuestion(next.id);
  }

  function resetCurrent() {
    const nextAnswers = { ...answers };
    delete nextAnswers[question.id];
    setDraft([]);
    persist(nextAnswers);
  }

  return (
    <div className="page bank-page">
      <section className="bank-hero">
        <div>
          <span className="eyebrow">PDF MOCK BANK · 116 QUESTIONS</span>
          <h1>COF-C03 模拟题库</h1>
          <p>逐题作答、即时判分，并把错误沉淀为可筛选的复盘队列。多选题会标明应选数量。</p>
        </div>
        <div className="bank-stats">
          <div><span>已答</span><b>{attempted}</b><small>/ 116</small></div>
          <div><span>正确</span><b>{correctCount}</b><small>{attempted ? ` · ${Math.round((correctCount / attempted) * 100)}%` : ''}</small></div>
        </div>
      </section>

      <div className="bank-toolbar">
        <label className="bank-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索题干或题号" /></label>
        <label className="bank-select"><Filter size={15} /><select value={domainId} onChange={(event) => setDomainId(event.target.value)} aria-label="按考试域筛选">
          <option value="all">全部考试域</option>
          {DOMAINS.map((item) => <option key={item.id} value={item.id}>{item.number} · {item.shortTitle}</option>)}
        </select></label>
        <div className="status-filters" aria-label="答题状态筛选">
          {([['all', '全部'], ['unanswered', '未答'], ['wrong', '错题'], ['favorite', '收藏']] as const).map(([value, label]) => (
            <button key={value} className={status === value ? 'active' : ''} onClick={() => setStatus(value)}>{label}</button>
          ))}
        </div>
      </div>

      <div className="bank-layout">
        <aside className="bank-index">
          <div className="bank-index-head"><span>题目导航</span><b>{filtered.length}</b></div>
          <div className="bank-index-grid">
            {filtered.map((item) => {
              const saved = answers[item.id];
              const state = saved ? (sameAnswers(saved, item.correctAnswers) ? 'done-correct' : 'done-wrong') : '';
              return <button key={item.id} aria-label={`第 ${item.number} 题`} className={`${item.id === question.id ? 'active' : ''} ${state}`} onClick={() => selectQuestion(item.id)}>{item.number}</button>;
            })}
          </div>
          {!filtered.length && <p className="bank-empty">当前筛选下没有题目。</p>}
          <div className="bank-legend"><span><i className="legend-correct" />正确</span><span><i className="legend-wrong" />错题</span></div>
        </aside>

        <article className="bank-question">
          <div className="bank-question-meta">
            <div><span>QUESTION {String(question.number).padStart(3, '0')}</span><b>DOMAIN {domain.number} · {domain.shortTitle}</b></div>
            <button className={favorites.includes(question.id) ? 'bookmark-button active' : 'bookmark-button'} onClick={() => persistFavorites(favorites.includes(question.id) ? favorites.filter((id) => id !== question.id) : [...favorites, question.id])} aria-label="收藏题目"><Bookmark size={17} fill={favorites.includes(question.id) ? 'currentColor' : 'none'} /></button>
          </div>
          <div className="question-type"><ListChecks size={15} /> {isMulti ? `多选题 · 请选择 ${question.correctAnswers.length} 项` : '单选题 · 点击后立即判分'}</div>
          <h2>{question.prompt}</h2>
          <div className="options-list bank-options">
            {question.options.map((option, optionIndex) => {
              const isCorrect = question.correctAnswers.includes(optionIndex);
              const isChosen = (savedAnswer || draft).includes(optionIndex);
              let optionState = isChosen && !revealed ? 'selected' : '';
              if (revealed && isCorrect) optionState = 'correct';
              else if (revealed && isChosen && !isCorrect) optionState = 'wrong';
              return <button key={`${question.id}-${optionIndex}`} disabled={revealed} className={`option ${optionState}`} onClick={() => choose(optionIndex)}>
                <span>{String.fromCharCode(65 + optionIndex)}</span><p>{option}</p>
                {optionState === 'selected' && <Check size={18} />}
                {optionState === 'correct' && <CheckCircle2 size={19} />}
                {optionState === 'wrong' && <XCircle size={19} />}
              </button>;
            })}
          </div>

          {revealed && <section className={sameAnswers(savedAnswer, question.correctAnswers) ? 'bank-explanation correct-explanation' : 'bank-explanation wrong-explanation'} aria-live="polite">
            <div className="bank-verdict">{sameAnswers(savedAnswer, question.correctAnswers) ? <CheckCircle2 size={20} /> : <XCircle size={20} />}<div><b>{sameAnswers(savedAnswer, question.correctAnswers) ? '回答正确' : '答案不正确'}</b><span>参考答案：{question.answerLabels.join('、')}</span></div></div>
            <div className="explanation-copy"><span>答案与解析</span><p>{question.explanation}</p></div>
            <div className="source-warning">来源：用户提供 PDF 第 {question.sourcePage} 页。社区题库答案与讨论仅作备考参考，并非 Snowflake 官方考试题或官方答案。</div>
          </section>}

          <div className="bank-question-actions">
            <button className="secondary-button" disabled={filteredIndex <= 0} onClick={() => move(-1)}><ArrowLeft size={16} /> 上一题</button>
            <div>
              {isMulti && !revealed && <button className="primary-button" disabled={!draft.length || draft.length > question.correctAnswers.length} onClick={submitMulti}>提交答案</button>}
              {revealed && <button className="text-button" onClick={resetCurrent}>重新作答</button>}
              <button className="primary-button" disabled={filteredIndex < 0 || filteredIndex >= filtered.length - 1} onClick={() => move(1)}>下一题 <ArrowRight size={16} /></button>
            </div>
          </div>
        </article>

        <aside className="bank-context">
          <span className="eyebrow">REVIEW CONTEXT</span>
          <h3>{domain.title}</h3>
          <div className="context-progress"><div><span>本域题目</span><b>{QUESTIONS.filter((item) => item.domainId === domain.id).length}</b></div><i><span style={{ width: `${domain.weight}%` }} /></i></div>
          <p>这套题用于检测概念边界与场景判断。遇到争议答案时，以应用内知识讲解和 Snowflake 官方文档为准。</p>
          <button className="context-link" onClick={() => { setDomainId(domain.id); setStatus('wrong'); }}>只看本域错题 <ChevronRight size={15} /></button>
        </aside>
      </div>
    </div>
  );
}
