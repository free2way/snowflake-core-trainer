import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ArrowRight, Clock3, ExternalLink, FlaskConical, Snowflake } from 'lucide-react';
import SnowLabSteps from '@/components/SnowLabSteps';
import { verifySession } from '@/lib/auth';
import { SNOW_LABS, snowLabSources } from '@/lib/snow-labs';

export const metadata: Metadata = { title: 'SNOW LABS · Snowpath' };

const levels = [
  { level: '基础', title: '基础 · 建立练习环境', description: '开通试用账户，掌握仓库、SQL、表和第一次文件装载。' },
  { level: '进阶', title: '进阶 · 装载与排错', description: '练习文件格式、装载防重、半结构化数据、性能检查与误删恢复。' },
  { level: '高级', title: '高级 · 治理与数据管道', description: '验证权限和脱敏，消费增量，最后用订单文件交付可对账报表。' },
  { level: '选修', title: 'AWS 实操 · 三个独立实验', description: '先建立 S3 只读集成，再任选自动 Snowpipe 或外部表。需要独立 AWS 练习账户。' },
] as const;

const labHref = (id: string) => `/labs?lab=${id}`;

export default async function SnowLabsPage({ searchParams }: { searchParams: Promise<{ lab?: string | string[] }> }) {
  const [params, cookieStore] = await Promise.all([searchParams, cookies()]);
  const activeIndex = SNOW_LABS.findIndex((lab) => lab.id === params.lab);
  const active = SNOW_LABS[activeIndex];
  if (!verifySession(cookieStore.get('snowpath_session')?.value)) {
    const target = active ? labHref(active.id) : '/labs';
    redirect(`/login?next=${encodeURIComponent(target)}`);
  }
  if (params.lab !== undefined && !active) notFound();

  const previous = SNOW_LABS[activeIndex - 1];
  const next = SNOW_LABS[activeIndex + 1];

  return (
    <div className="snow-labs-shell">
      <header className="snow-labs-top">
        <div>
          <Link href="/labs" className="brand"><span className="brand-mark"><Snowflake size={19} aria-hidden /></span> SNOW LABS</Link>
          <Link href="/" className="snow-labs-back"><ArrowLeft size={16} aria-hidden /> 返回备考工作台</Link>
        </div>
      </header>
      <main className="page snow-labs-page">
        {active ? (
          <div className="snow-labs-detail">
            <Link className="snow-labs-back" href="/labs"><ArrowLeft size={16} aria-hidden /> 全部实验</Link>
            <h1>{active.title}</h1>
            <p className="snow-labs-lead">{active.outcome}</p>
            <div className="snow-labs-meta"><span>{active.level}</span><span><Clock3 size={16} aria-hidden /> 约 {active.minutes} 分钟</span></div>
            <p className="snow-labs-requires"><strong>开始前</strong> {active.requires} {active.prerequisite && <Link href={labHref(active.prerequisite)}>打开前置实验</Link>}</p>
            <SnowLabSteps key={active.id} id={active.id} steps={active.steps} />
            <h2 className="snow-labs-reference-title">实验参考</h2>
            <div className="snow-labs-links">
              {active.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}<ExternalLink size={14} aria-hidden /></a>)}
            </div>
            <nav className="snow-labs-next" aria-label="相邻实验">
              {previous && <Link href={labHref(previous.id)}><ArrowLeft size={16} aria-hidden /> {previous.title}</Link>}
              {next && <Link href={labHref(next.id)}>{next.title} <ArrowRight size={16} aria-hidden /></Link>}
            </nav>
          </div>
        ) : (
          <>
            <section className="snow-labs-heading">
              <div>
                <h1>SNOW LABS</h1>
                <p className="snow-labs-lead">从申请 Snowflake 试用账户，到交付一条可以重跑和对账的数据管道。</p>
              </div>
              <Link className="primary-button" href={labHref('trial')}>从试用账户开始 <ArrowRight size={17} aria-hidden /></Link>
            </section>
            <div className="snow-labs-catalog">
              <div>
                {levels.map(({ level, title, description }) => (
                  <section className="snow-labs-level" key={level}>
                    <h2>{title}</h2>
                    <p>{description}</p>
                    <ul>
                      {SNOW_LABS.filter((lab) => lab.level === level).map((lab) => (
                        <li key={lab.id}><Link href={labHref(lab.id)}>
                          <div><strong>{lab.title}</strong><span>{lab.outcome}</span></div>
                          <small>{lab.minutes} 分钟</small><ArrowRight size={17} aria-hidden />
                        </Link></li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
              <aside className="snow-labs-guide">
                <FlaskConical size={22} aria-hidden />
                <h2>课程怎么用</h2>
                <p>{SNOW_LABS.length} 个实验，每一步都有操作、验收结果和排错提示。执行 SQL 后可勾选步骤，进度保存在当前浏览器。</p>
                <p>课程从视频介绍的架构与仓库起步，用 Bootcamp 的 CSV 和 JSON 练习装载，再推进到恢复、治理和增量。综合项目接入动态表，用两天订单验证报表结果。</p>
                <div className="snow-labs-links">
                  <a href={snowLabSources.video} target="_blank" rel="noreferrer">观看原视频 27:41 <ExternalLink size={14} aria-hidden /></a>
                  <a href={snowLabSources.bootcamp} target="_blank" rel="noreferrer">Bootcamp 样例与原始 SQL <ExternalLink size={14} aria-hidden /></a>
                </div>
                <details className="snow-labs-troubleshoot">
                  <summary>课程做完后清理环境</summary>
                  <p>先按各 Lab 的最后一步清理。AWS Lab 的 bucket、IAM 和集成按 S3 Lab 的退役步骤处理。确认只包含课程对象后，再删除专用数据库和仓库。</p>
                  <pre><code>{'USE ROLE ACCOUNTADMIN;\nDROP DATABASE IF EXISTS SNOW_LABS_TRAINING;\nDROP WAREHOUSE IF EXISTS SNOW_LABS_XS;'}</code></pre>
                </details>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
