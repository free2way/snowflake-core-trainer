'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import type { SnowLabStep } from '@/lib/snow-labs';

function CommandBlock({ code, label }: { code: string; label: string }) {
  const [result, setResult] = useState('');

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setResult('已复制');
    } catch {
      setResult('请选择下方代码手动复制');
    }
  }

  return (
    <div className="snow-command">
      <div className="snow-command-bar">
        <span>{label}</span>
        <button type="button" onClick={copy}><Copy size={15} aria-hidden /> 复制{label === '终端' ? '命令' : ` ${label}`}</button>
      </div>
      <pre tabIndex={0} aria-label={label}><code>{code}</code></pre>
      <span className="snow-copy-result" role="status">{result}</span>
    </div>
  );
}

export default function SnowLabSteps({ id, steps }: { id: string; steps: SnowLabStep[] }) {
  const storageKey = `snowpath-snow-labs-v1:${id}`;
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
      if (Array.isArray(value)) {
        setCompleted([...new Set(value.filter(
          (item): item is number => Number.isInteger(item) && item >= 0 && item < steps.length,
        ))]);
      }
    } catch {
      // The checklist can still be used when storage is unavailable.
    }
  }, [storageKey, steps.length]);

  function setStep(index: number, checked: boolean) {
    const next = checked ? [...completed, index] : completed.filter((item) => item !== index);
    setCompleted(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Browser storage is optional.
    }
  }

  return (
    <section aria-label="实验步骤">
      <div className="snow-labs-progress">
        <div><strong>实验步骤</strong><span aria-live="polite">{completed.length} / {steps.length} 已完成</span></div>
        <progress max={steps.length} value={completed.length} aria-label="实验完成进度" />
      </div>
      <ol className="snow-labs-steps">
        {steps.map((step, index) => (
          <li key={step.title}>
            <h2>{step.title}</h2>
            <p>{step.action}</p>
            {step.files?.length ? (
              <div className="snow-labs-links">
                {step.files.map((file) => (
                  <a key={file.url} href={file.url} target="_blank" rel="noreferrer">
                    {file.label}<ExternalLink size={14} aria-hidden />
                  </a>
                ))}
              </div>
            ) : null}
            {step.sql ? <CommandBlock code={step.sql} label="SQL" /> : null}
            {step.terminal ? <CommandBlock code={step.terminal} label="终端" /> : null}
            {step.json ? <CommandBlock code={step.json} label="JSON" /> : null}
            <div className="snow-labs-expected">
              <CheckCircle2 size={17} aria-hidden />
              <p><strong>验收</strong> {step.expected}</p>
            </div>
            <details className="snow-labs-troubleshoot">
              <summary>排错提示</summary>
              <p>{step.troubleshooting}</p>
            </details>
            <label className="snow-labs-check">
              <input type="checkbox" checked={completed.includes(index)} onChange={(event) => setStep(index, event.target.checked)} />
              已完成：{step.title}
            </label>
          </li>
        ))}
      </ol>
    </section>
  );
}
