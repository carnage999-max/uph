import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'uph_admin_session';
const encoder = new TextEncoder();

function getSecret(){
  // Support fallback env name for Amplify (UPH_ prefix)
  const secret = process.env.ADMIN_JWT_SECRET || process.env.UPH_ADMIN_JWT_SECRET;
  if (!secret){
    throw new Error('Missing ADMIN_JWT_SECRET (or UPH_ADMIN_JWT_SECRET) environment variable.');
  }
  return encoder.encode(secret);
}

export async function createSessionToken(payload: Record<string, unknown>){
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(getSecret());
}

export async function verifySessionToken(token: string){
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as { email: string; iat: number; exp: number };
  } catch {
    return null;
  }
}

