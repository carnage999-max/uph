/**
 * Turnstile verification utility for server-side token validation
 */

export async function verifyTurnstileToken(token: string): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error('TURNSTILE_SECRET_KEY is not set in environment variables');
    // In development, allow requests to proceed without verification
    if (process.env.NODE_ENV === 'development') {
      return { success: true };
    }
    return { success: false, error: 'Bot protection not configured' };
  }

  if (!token) {
    return { success: false, error: 'CAPTCHA token is missing' };
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
      }),
    });

    if (!response.ok) {
      return { success: false, error: 'Turnstile verification failed' };
    }

    const data = await response.json() as { success: boolean; 'error-codes'?: string[] };

    if (!data.success) {
      console.error('Turnstile verification error:', data['error-codes']);
      return { success: false, error: 'CAPTCHA verification failed' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error verifying Turnstile token:', error);
    return { success: false, error: 'Failed to verify CAPTCHA' };
  }
}
