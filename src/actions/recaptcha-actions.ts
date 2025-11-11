'use server';

interface RecaptchaVerifyResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

/**
 * Verify reCAPTCHA v3 token on the server
 * @param token - The reCAPTCHA token from the client
 * @param expectedAction - The expected action name (e.g., 'login', 'signup')
 * @param minScore - Minimum acceptable score (0.0 to 1.0), default 0.5
 * @returns Object with success status and optional error message
 */
export async function verifyRecaptcha(
  token: string,
  expectedAction: string,
  minScore: number = 0.5
): Promise<{ success: boolean; score?: number; error?: string }> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.error('reCAPTCHA secret key not configured');
    return {
      success: false,
      error: 'reCAPTCHA configuration error',
    };
  }

  if (!token) {
    return {
      success: false,
      error: 'reCAPTCHA token is required',
    };
  }

  try {
    // Verify token with Google
    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${secretKey}&response=${token}`,
      }
    );

    const data: RecaptchaVerifyResponse = await response.json();

    // Check if verification was successful
    if (!data.success) {
      console.error('reCAPTCHA verification failed:', data['error-codes']);
      return {
        success: false,
        error: 'reCAPTCHA verification failed',
      };
    }

    // Check if action matches
    if (data.action !== expectedAction) {
      console.error(
        `reCAPTCHA action mismatch: expected "${expectedAction}", got "${data.action}"`
      );
      return {
        success: false,
        error: 'Invalid reCAPTCHA action',
      };
    }

    // Check score (v3 only)
    const score = data.score ?? 0;
    if (score < minScore) {
      console.warn(
        `reCAPTCHA score too low: ${score} (minimum: ${minScore})`
      );
      return {
        success: false,
        score,
        error: 'reCAPTCHA score too low. Please try again.',
      };
    }

    // Success
    return {
      success: true,
      score,
    };
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return {
      success: false,
      error: 'Failed to verify reCAPTCHA',
    };
  }
}
