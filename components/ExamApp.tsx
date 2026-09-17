'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronRight, Circle,
  Clock3, Code2, Copy, ExternalLink, FlaskConical, Gauge, LayoutDashboard, Library,
  LogOut, Menu, RotateCcw, Snowflake, Target, X, XCircle,
} from 'lucide-react';
import { DOMAINS, EXAM_META, QUIZ_QUESTIONS, TOTAL_TOPICS } from '@/lib/content';
import type { Domain, Topic, ViewMode } from '@/lib/types';
import QuestionBankView from '@/components/QuestionBankView';
import TopicLab from '@/components/TopicLab';

export default function ExamApp() {
  const [view, setView] = useState<ViewMode>('plan');
  const [activeDomainId, setActiveDomainId] = useState(DOMAINS[0].id);
  const [activeTopicId, setActiveTopicId] = useState(DOMAINS[0].topics[0].id);
  const [completed, setCompleted] = useState<string[]>([]);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('snowpath-completed');
    if (saved) setCompleted(JSON.parse(saved));
  }, []);

  const activeDomain = DOMAINS.find((item) => item.id === activeDomainId) || DOMAINS[0];
  const activeTopic = activeDomain.topics.find((item) => item.id === activeTopicId) || activeDomain.topics[0];
  const progress = Math.round((completed.length / TOTAL_TOPICS) * 100);

  function persistCompleted(next: string[]) {
    setCompleted(next);
    localStorage.setItem('snowpath-completed', JSON.stringify(next));
  }

  function selectDomain(domain: Domain) {
    setActiveDomainId(domain.id);
    setActiveTopicId(domain.topics[0].id);
    setView('learn');
    setNavOpen(false);
  }

  function selectTopic(domain: Domain, topic: Topic) {
    setActiveDomainId(domain.id);
    setActiveTopicId(topic.id);
    setView('learn');
  }

  function toggleComplete(topicId: string) {
    persistCompleted(completed.includes(topicId) ? completed.filter((id) => id !== topicId) : [...completed, topicId]);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${navOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-head">
          <button className="brand brand-button" onClick={() => { setView('plan'); setNavOpen(false); }}>
            <span className="brand-mark"><Snowflake size={19} strokeWidth={2.4} /></span>
            <span>SNOWPATH</span>
          </button>
          <button className="icon-button mobile-close" onClick={() => setNavOpen(false)} aria-label="关闭导航"><X size={19} /></button>
        </div>

        <div className="exam-chip">
          <span>当前目标</span>
          <strong>SnowPro Core</strong>
          <small>{EXAM_META.code} · 2026 新版</small>
        </div>

        <nav className="sidebar-nav" aria-label="主导航">
          <p className="nav-label">工作台</p>
          <button className={view === 'plan' ? 'nav-item active' : 'nav-item'} onClick={() => { setView('plan'); setNavOpen(false); }}>
            <LayoutDashboard size={17} /><span>学习总览</span>
          </button>
          <button className={view === 'quiz' ? 'nav-item active' : 'nav-item'} onClick={() => { setView('quiz'); setNavOpen(false); }}>
            <Target size={17} /><span>全域模拟</span><em>10</em>
          </button>
          <button className={view === 'bank' ? 'nav-item active' : 'nav-item'} onClick={() => { setView('bank'); setNavOpen(false); }}>
            <Library size={17} /><span>模拟题库</span><em>116</em>
          </button>

          <p className="nav-label domain-label">考试域</p>
          {DOMAINS.map((domain) => {
            const done = domain.topics.filter((topic) => completed.includes(topic.id)).length;
            const Icon = domain.icon || Circle;
            return (
              <button key={domain.id} className={view === 'learn' && activeDomainId === domain.id ? 'nav-item domain-item active' : 'nav-item domain-item'} onClick={() => selectDomain(domain)}>
                <Icon size={17} /><span><b>{domain.shortTitle}</b><small>{done}/{domain.topics.length} 已完成</small></span><em>{domain.weight}%</em>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-progress">
          <div><span>总进度</span><b>{progress}%</b></div>
          <div className="progress-track"><i style={{ width: `${progress}%` }} /></div>
          <small>{completed.length} / {TOTAL_TOPICS} 个知识单元</small>
        </div>

        <form action="/api/auth/logout" method="post">
          <button className="logout-button" type="submit"><LogOut size={16} /> 退出登录</button>
        </form>
      </aside>

      {navOpen && <button className="nav-scrim" onClick={() => setNavOpen(false)} aria-label="关闭导航" />}

      <main className="workspace">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setNavOpen(true)} aria-label="打开导航"><Menu size={20} /></button>
          <div className="breadcrumb">
            <span>SNOWPRO CORE</span><ChevronRight size={14} />
            <strong>{view === 'plan' ? '学习总览' : view === 'quiz' ? '全域模拟' : view === 'bank' ? '模拟题库' : activeDomain.shortTitle}</strong>
          </div>
          <div className="topbar-meta"><span className="status-dot" /> 内容基于 COF-C03</div>
          <div className="avatar" title="admin">AD</div>
        </header>

        {view === 'plan' && <PlanView completed={completed} progress={progress} onSelect={selectTopic} onStartQuiz={() => setView('quiz')} />}
        {view === 'learn' && <LearnView domain={activeDomain} topic={activeTopic} completed={completed} onSelectTopic={(topic) => setActiveTopicId(topic.id)} onToggleComplete={() => toggleComplete(activeTopic.id)} onMove={(direction) => {
          const topics = activeDomain.topics;
          const index = topics.findIndex((item) => item.id === activeTopic.id);
          const next = topics[index + direction];
          if (next) setActiveTopicId(next.id);
        }} />}
        {view === 'quiz' && <QuizView />}
        {view === 'bank' && <QuestionBankView />}
      </main>
    </div>
  );
}

function PlanView({ completed, progress, onSelect, onStartQuiz }: { completed: string[]; progress: number; onSelect: (domain: Domain, topic: Topic) => void; onStartQuiz: () => void }) {
  const next = DOMAINS.flatMap((domain) => domain.topics.map((topic) => ({ domain, topic }))).find(({ topic }) => !completed.includes(topic.id));
  return (
    <div className="page plan-page">
      <section className="page-intro">
        <div>
          <span className="eyebrow">COF-C03 STUDY DESK</span>
          <h1>今天，从最重要的 <span>31%</span> 开始。</h1>
          <p>新版考试把架构、现代应用与 AI 能力放到更核心的位置。按权重学习，再用场景题验证判断。</p>
        </div>
        <button className="primary-button" onClick={() => next && onSelect(next.domain, next.topic)}>
          {progress ? '继续上次学习' : '开始学习'} <ArrowRight size={18} />
        </button>
      </section>

      <section className="exam-strip" aria-label="考试信息">
        <div><span>考试版本</span><strong>{EXAM_META.code}</strong></div>
        <div><span>题目数量</span><strong>{EXAM_META.questions} 题</strong></div>
        <div><span>考试时长</span><strong>{EXAM_META.minutes} 分钟</strong></div>
        <div><span>通过分数</span><strong>{EXAM_META.passScore} / 1000</strong></div>
        <div className="progress-stat"><span>你的进度</span><strong>{progress}%</strong><div className="progress-track"><i style={{ width: `${progress}%` }} /></div></div>
      </section>

      <div className="plan-grid">
        <section className="domains-section">
          <div className="section-heading"><div><span className="eyebrow">BLUEPRINT</span><h2>五大考试域</h2></div><p>权重越高，建议投入越多复习时间。</p></div>
          <div className="domain-list">
            {DOMAINS.map((domain) => {
              const done = domain.topics.filter((topic) => completed.includes(topic.id)).length;
              const Icon = domain.icon || Circle;
              return (
                <button className="domain-row" key={domain.id} onClick={() => onSelect(domain, domain.topics[0])}>
                  <span className="domain-number">{domain.number}</span>
                  <span className="domain-icon"><Icon size={19} /></span>
                  <span className="domain-copy"><strong>{domain.title}</strong><small>{domain.topics.length} 个单元 · {done} 个已完成</small></span>
                  <span className="weight-visual"><i style={{ width: `${domain.weight / 0.31}%` }} /></span>
                  <b className="domain-weight">{domain.weight}%</b><ChevronRight size={18} />
                </button>
              );
            })}
          </div>
        </section>

        <aside className="focus-panel">
          <span className="eyebrow eyebrow-light">EXAM FOCUS</span>
          <h2>COF-C03 变化速览</h2>
          <p>从 6 域重组为 5 域，架构域增至 31%。不要再按旧版资料平均用力。</p>
          <ul>
            <li><span>01</span><div><b>AI 与应用开发进入核心</b><small>Cortex、Snowpark、Notebooks、Streamlit</small></div></li>
            <li><span>02</span><div><b>治理与成本归入账户管理</b><small>Policy、Budget、Usage views</small></div></li>
            <li><span>03</span><div><b>协作不只 Secure Sharing</b><small>Listings、Clean Rooms、Replication</small></div></li>
          </ul>
          <button className="ghost-button ghost-light" onClick={onStartQuiz}>先做一次全域诊断 <ArrowRight size={16} /></button>
        </aside>
      </div>

      <p className="source-note">内容结构依据 Snowflake 官方 COF-C03 能力范围与 2026 学习路径重新编排。产品内练习题为原创，不包含真实考试题。</p>
    </div>
  );
}

function LearnView({ domain, topic, completed, onSelectTopic, onToggleComplete, onMove }: { domain: Domain; topic: Topic; completed: string[]; onSelectTopic: (topic: Topic) => void; onToggleComplete: () => void; onMove: (direction: number) => void }) {
  const [copied, setCopied] = useState(false);
  const [lessonMode, setLessonMode] = useState<'content' | 'lab'>('content');
  const index = domain.topics.findIndex((item) => item.id === topic.id);
  const isDone = completed.includes(topic.id);

  useEffect(() => setLessonMode('content'), [topic.id]);

  async function copySql() {
    if (!topic.practice) return;
    await navigator.clipboard.writeText(topic.practice.sql);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="page learn-page">
      <section className="learn-head">
        <div><span className="eyebrow">DOMAIN {domain.number} · {domain.weight}%</span><h1>{domain.title}</h1><p>{domain.description}</p></div>
        <div className="domain-ring" style={{ '--progress': `${(domain.topics.filter((item) => completed.includes(item.id)).length / domain.topics.length) * 360}deg` } as React.CSSProperties}>
          <span><b>{domain.topics.filter((item) => completed.includes(item.id)).length}</b>/{domain.topics.length}</span>
        </div>
      </section>

      <div className="learn-layout">
        <aside className="topic-rail">
          <p className="nav-label">本域知识单元</p>
          {domain.topics.map((item, itemIndex) => (
            <button key={item.id} className={item.id === topic.id ? 'topic-link active' : 'topic-link'} onClick={() => onSelectTopic(item)}>
              {completed.includes(item.id) ? <CheckCircle2 size={17} /> : <span>{String(itemIndex + 1).padStart(2, '0')}</span>}
              <div><b>{item.title}</b><small>{item.minutes} 分钟</small></div>
            </button>
          ))}
        </aside>

        <article className="lesson">
          <div className="lesson-title">
            <span>{topic.kicker}</span><h2>{topic.title}</h2><p>{topic.summary}</p>
            <div className="lesson-time"><Clock3 size={15} /> 约 {topic.minutes} 分钟</div>
          </div>

          <div className="lesson-tabs" role="tablist" aria-label="知识讲解与实验">
            <button role="tab" aria-selected={lessonMode === 'content'} className={lessonMode === 'content' ? 'active' : ''} onClick={() => setLessonMode('content')}><BookOpen size={16} /> 详细讲解</button>
            <button role="tab" aria-selected={lessonMode === 'lab'} className={lessonMode === 'lab' ? 'active' : ''} onClick={() => setLessonMode('lab')}><FlaskConical size={16} /> Lab 实验</button>
          </div>

          {lessonMode === 'content' ? <>
          <section className="lesson-section">
            <div className="lesson-section-label"><span>01</span><b>学习目标</b></div>
            <div className="objective-list">
              {topic.objectives.map((item) => <div key={item}><Check size={16} /><span>{item}</span></div>)}
            </div>
          </section>

          <section className="lesson-section">
            <div className="lesson-section-label"><span>02</span><b>考试要点</b></div>
            <div className="note-list">
              {topic.examNotes.map((item, noteIndex) => <div key={item}><b>{String(noteIndex + 1).padStart(2, '0')}</b><p>{item}</p></div>)}
            </div>
          </section>

          <section className="trap-note"><span>易错辨析</span><p>{topic.trap}</p></section>

          {topic.detailSections?.map((section, sectionIndex) => <section className="lesson-section deep-dive" key={section.title}>
            <div className="lesson-section-label"><span>{String(sectionIndex + 3).padStart(2, '0')}</span><b>深度讲解</b></div>
            <div className="deep-dive-copy"><h3>{section.title}</h3><p>{section.body}</p>{section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}</div>
          </section>)}

          {topic.practice && <section className="code-lab">
            <div><span><Code2 size={16} /> HANDS-ON</span><h3>{topic.practice.title}</h3><button onClick={copySql}><Copy size={15} /> {copied ? '已复制' : '复制 SQL'}</button></div>
            <pre><code>{topic.practice.sql}</code></pre><p>{topic.practice.note}</p>
          </section>}

          {topic.officialLinks?.length ? <section className="official-links"><div><span>OFFICIAL REFERENCE</span><h3>延伸阅读</h3></div>{topic.officialLinks.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.title}<ExternalLink size={14} /></a>)}</section> : null}
          </> : topic.lab ? <TopicLab topicId={topic.id} lab={topic.lab} /> : <div className="lab-unavailable">此知识点的实验正在整理。</div>}

          <div className="lesson-actions">
            <button className="secondary-button" disabled={index === 0} onClick={() => onMove(-1)}><ArrowLeft size={16} /> 上一单元</button>
            <button className={isDone ? 'complete-button done' : 'complete-button'} onClick={onToggleComplete}>{isDone ? <><Check size={17} /> 已完成</> : '标记为已完成'}</button>
            <button className="secondary-button" disabled={index === domain.topics.length - 1} onClick={() => onMove(1)}>下一单元 <ArrowRight size={16} /></button>
          </div>
        </article>
      </div>
    </div>
  );
}

function QuizView() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);
  const question = QUIZ_QUESTIONS[index];
  const correct = useMemo(() => QUIZ_QUESTIONS.filter((item) => answers[item.id] === item.answer).length, [answers]);

  function confirm() {
    if (selected === null) return;
    setAnswers((current) => ({ ...current, [question.id]: selected }));
  }

  function next() {
    if (index === QUIZ_QUESTIONS.length - 1) { setFinished(true); return; }
    setIndex((value) => value + 1);
    setSelected(null);
  }

  function restart() { setIndex(0); setSelected(null); setAnswers({}); setFinished(false); }

  if (finished) {
    const percentage = Math.round((correct / QUIZ_QUESTIONS.length) * 100);
    return <div className="page quiz-page"><section className="result-panel">
      <span className="eyebrow">DIAGNOSTIC COMPLETE</span>
      <div className="score-orbit"><strong>{percentage}</strong><span>分</span></div>
      <h1>{percentage >= 80 ? '状态很好，可以进入冲刺。' : percentage >= 60 ? '基础已建立，继续补齐薄弱域。' : '先回到学习路径，逐域建立判断。'}</h1>
      <p>本次答对 {correct} / {QUIZ_QUESTIONS.length} 题。建议重点复盘所有错误解释，而不是只记答案。</p>
      <div className="result-actions"><button className="primary-button" onClick={restart}><RotateCcw size={17} /> 重新测试</button></div>
    </section></div>;
  }

  const revealed = answers[question.id] !== undefined;
  const domain = DOMAINS.find((item) => item.id === question.domainId)!;
  return (
    <div className="page quiz-page">
      <section className="quiz-head"><div><span className="eyebrow">FULL BLUEPRINT CHECK</span><h1>COF-C03 全域诊断</h1><p>每题选择一个最佳答案。提交后立即查看辨析。</p></div><div className="quiz-count"><b>{String(index + 1).padStart(2, '0')}</b><span>/ {QUIZ_QUESTIONS.length}</span></div></section>
      <div className="quiz-progress"><i style={{ width: `${((index + 1) / QUIZ_QUESTIONS.length) * 100}%` }} /></div>
      <section className="question-panel">
        <div className="question-meta"><span>DOMAIN {domain.number}</span><b>{domain.shortTitle}</b></div>
        <h2>{question.prompt}</h2>
        <div className="options-list">
          {question.options.map((option, optionIndex) => {
            let state = '';
            if (revealed && optionIndex === question.answer) state = 'correct';
            else if (revealed && optionIndex === answers[question.id]) state = 'wrong';
            else if (selected === optionIndex) state = 'selected';
            return <button key={option} disabled={revealed} className={`option ${state}`} onClick={() => setSelected(optionIndex)}>
              <span>{String.fromCharCode(65 + optionIndex)}</span><p>{option}</p>{state === 'correct' && <CheckCircle2 size={19} />}{state === 'wrong' && <XCircle size={19} />}
            </button>;
          })}
        </div>
        {revealed && <div className={answers[question.id] === question.answer ? 'answer-note correct-note' : 'answer-note wrong-note'}>
          <div>{answers[question.id] === question.answer ? <CheckCircle2 size={19} /> : <XCircle size={19} />}<b>{answers[question.id] === question.answer ? '回答正确' : '这题需要复盘'}</b><span>{question.reference}</span></div><p>{question.explanation}</p>
        </div>}
        <div className="question-actions">
          <span>已答对 {correct} 题</span>
          {!revealed ? <button className="primary-button" disabled={selected === null} onClick={confirm}>确认答案</button> : <button className="primary-button" onClick={next}>{index === QUIZ_QUESTIONS.length - 1 ? '查看结果' : '下一题'} <ArrowRight size={17} /></button>}
        </div>
      </section>
    </div>
  );
}
