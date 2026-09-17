import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Snowpath · COF-C03 备考工作台',
  description: '面向 SnowPro Core COF-C03 的中文学习与模考应用',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
