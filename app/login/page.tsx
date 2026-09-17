'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Eye, EyeOff, Snowflake } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin1234');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({ message: '登录失败，请重试' }));
      setError(body.message);
      setLoading(false);
      return;
    }
    router.push('/');
    router.refresh();
  }

  return (
    <main className="login-page">
      <div className="login-atmosphere" aria-hidden="true">
        <span className="orb orb-one" /><span className="orb orb-two" />
        <div className="grid-plane" />
      </div>

      <section className="login-story">
        <a className="brand brand-light" href="#" aria-label="Snowpath 首页">
          <span className="brand-mark"><Snowflake size={20} strokeWidth={2.3} /></span>
          <span>SNOWPATH</span>
        </a>
        <div className="story-copy">
          <span className="eyebrow eyebrow-light">SNOWPRO CORE · COF-C03</span>
          <h1>把新版考纲，<br />变成一条清晰路径。</h1>
          <p>围绕 2026 COF-C03 五大考试域重构，从概念辨析到情境判断，专注真正会考的能力。</p>
          <div className="story-proof">
            <span><Check size={15} /> 5 个最新考试域</span>
            <span><Check size={15} /> 中文重点与易错项</span>
            <span><Check size={15} /> 场景化练习题</span>
          </div>
        </div>
        <p className="story-foot">UPDATED FOR THE 2026 EXAM BLUEPRINT</p>
      </section>

      <section className="login-panel">
        <form className="login-form" onSubmit={submit}>
          <div className="mobile-brand"><span className="brand-mark"><Snowflake size={18} /></span> SNOWPATH</div>
          <span className="eyebrow">WELCOME BACK</span>
          <h2>进入备考工作台</h2>
          <p className="form-intro">继续你的 COF-C03 学习进度。</p>

          <label>
            <span>用户名</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
          </label>
          <label>
            <span>密码</span>
            <div className="password-field">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? '隐藏密码' : '显示密码'}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button login-button" type="submit" disabled={loading}>
            <span>{loading ? '正在验证…' : '登录并继续'}</span><ArrowRight size={18} />
          </button>
          <p className="credential-hint">演示账号 <code>admin</code> · 密码 <code>admin1234</code></p>
        </form>
      </section>
    </main>
  );
}
