import { createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_HOURS = 12;

function sign(payload: string) {
  const secret = process.env.APP_SESSION_SECRET || 'snowpath-local-dev-secret';
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function createSession(username: string) {
  const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const payload = `${username}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySession(token?: string) {
  if (!token) return false;
  const [username, expiresAt, signature] = token.split('.');
  if (!username || !expiresAt || !signature || Number(expiresAt) < Date.now()) return false;
  const expected = sign(`${username}.${expiresAt}`);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}
