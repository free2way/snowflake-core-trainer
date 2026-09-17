import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/login', request.url), { status: 303 });
  response.cookies.set('snowpath_session', '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}
