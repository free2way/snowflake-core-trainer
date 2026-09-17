import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = process.env.APP_USERNAME || 'admin';
  const password = process.env.APP_PASSWORD || 'admin1234';

  if (body.username !== username || body.password !== password) {
    return NextResponse.json({ message: '用户名或密码不正确' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('snowpath_session', createSession(username), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
  return response;
}
