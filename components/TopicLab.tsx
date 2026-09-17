'use client';

import { useEffect, useState } from 'react';
import { Check, CheckCircle2, Copy, ExternalLink, FlaskConical, Lightbulb, RotateCcw, ShieldCheck } from 'lucide-react';
import type { Lab } from '@/lib/types';

export default function TopicLab({ topicId, lab }: { topicId: string; lab: Lab }) {
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const storageKey = `snowpath-lab-${topicId}-v1`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      setDoneSteps([]);
      return;
    }
    try {
      setDoneSteps(JSON.parse(saved) as number[]);
    } catch {
      localStorage.removeItem(storageKey);
      setDoneSteps([]);
    }
  }, [storageKey]);

  function toggleStep(index: number) {
    setDoneSteps((current) => {
      const next = current.includes(index) ? current.filter((item) => item !== index) : [...current, index];
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }

  async function copySql(index: number, sql: string) {
    await navigator.clipboard.writeText(sql);
    setCopiedStep(index);
    window.setTimeout(() => setCopiedStep(null), 1400);
  }

  function reset() {
    setDoneSteps([]);
    localStorage.removeItem(storageKey);
  }

  return (
    <div className="lab-workspace">
      <section className="lab-intro">
        <div className="lab-icon"><FlaskConical size={21} /></div>
        <div><span>REPEATABLE HANDS-ON LAB</span><h3>{lab.title}</h3><p>{lab.objective}</p></div>
        <div className="lab-score"><b>{doneSteps.length}</b><span>/ {lab.steps.length} 步</span></div>
      </section>

      <section className="lab-readiness">
        <div><ShieldCheck size={17} /><span><b>开始前确认</b>{lab.prerequisites.join(' · ')}</span></div>
        <a href="https://signup.snowflake.com/" target="_blank" rel="noreferrer">注册 Snowflake 免费账户 <ExternalLink size={13} /></a>
      </section>

      {lab.editionNote && <div className="edition-note"><Lightbulb size={17} /><p><b>版本提示</b>{lab.editionNote}</p></div>}

      <div className="lab-steps">
        {lab.steps.map((step, index) => {
          const done = doneSteps.includes(index);
          return <section className={done ? 'lab-step complete' : 'lab-step'} key={`${topicId}-${step.title}`}>
            <button className="step-status" onClick={() => toggleStep(index)} aria-label={done ? `取消完成步骤 ${index + 1}` : `完成步骤 ${index + 1}`}>{done ? <Check size={16} /> : index + 1}</button>
            <div className="step-body">
              <div className="step-heading"><div><span>STEP {String(index + 1).padStart(2, '0')}</span><h4>{step.title}</h4></div>{done && <span className="done-label"><CheckCircle2 size={14} /> 已验证</span>}</div>
              <p>{step.instruction}</p>
              {step.sql && <div className="lab-code"><button onClick={() => copySql(index, step.sql || '')}><Copy size={14} /> {copiedStep === index ? '已复制' : '复制 SQL'}</button><pre><code>{step.sql}</code></pre></div>}
              <div className="step-guidance"><div><Lightbulb size={14} /><p><b>提示</b>{step.hint}</p></div><div><CheckCircle2 size={14} /><p><b>验证</b>{step.verify}</p></div></div>
            </div>
          </section>;
        })}
      </div>

      <div className="lab-footer"><p>每个 Lab 的最后一步会清理当前 schema，并挂起仓库。保留数据库和 X-Small 仓库便于下一项实验复用。</p><button className="text-button" onClick={reset}><RotateCcw size={14} /> 重置步骤状态</button></div>
    </div>
  );
}
