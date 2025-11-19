import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth/session';

export async function requireAdminAuth(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  
  if (!token) {
    return NextResponse.json(
      { message: 'Unauthorized - missing session' },
      { status: 401 }
    );
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.json(
      { message: 'Unauthorized - invalid session' },
      { status: 401 }
    );
  }

  return null; // Authorized
}
