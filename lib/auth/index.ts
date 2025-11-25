import { cookies } from 'next/headers';
import crypto from 'crypto';
import { createSessionToken, verifySessionToken, SESSION_COOKIE } from './session';

export async function requireAdminSession(){
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(token: string){
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
}

export async function clearSessionCookie(){
  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE,
    value: '',
    path: '/',
    maxAge: 0,
  });
}

export function isAdminCredentialsValid(email: string, password: string){
  // Support fallback env names for Amplify (UPH_ prefix)
  const expectedEmail = process.env.ADMIN_EMAIL || process.env.UPH_ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD || process.env.UPH_ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword){
    throw new Error('Admin credentials are not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD (or UPH_ADMIN_EMAIL and UPH_ADMIN_PASSWORD).');
  }
  const isEmailMatch = email.trim().toLowerCase() === expectedEmail.trim().toLowerCase();
  const passwordBytesA = Buffer.from(password);
  const passwordBytesB = Buffer.from(expectedPassword);
  if (passwordBytesA.length !== passwordBytesB.length) return false;
  return isEmailMatch && crypto.timingSafeEqual(passwordBytesA, passwordBytesB);
}

export { createSessionToken, verifySessionToken, SESSION_COOKIE } from './session';
