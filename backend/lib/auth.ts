import type admin from 'firebase-admin';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { auth } from './firebase-admin';

const redis = Redis.fromEnv();

/** Per Firebase uid, fixed 24h window. */
const RATE_LIMIT_USER_PER_DAY = 30;
/** Shared cap across all users, fixed 24h window. */
const RATE_LIMIT_GLOBAL_PER_DAY = 1000;

const userLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(RATE_LIMIT_USER_PER_DAY, '24 h'),
  prefix: 'rate:user:sos',
});

const globalLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(RATE_LIMIT_GLOBAL_PER_DAY, '24 h'),
  prefix: 'rate:global:sos',
});

function retryAfterSeconds(resetMs: number): number {
  return Math.max(0, Math.ceil((resetMs - Date.now()) / 1000));
}

/**
 * Extracts and verifies the Firebase ID token from the request.
 * Expects: Authorization: Bearer <token>
 *
 * @returns DecodedIdToken (uid, email, etc.) on success
 * @throws Response with status 401 on missing header, invalid token, or expired token
 */
export async function verifyToken(req: Request): Promise<admin.auth.DecodedIdToken> {
  const header = req.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) {
    throw new Response('Unauthorized', { status: 401 });
  }
  const token = header.slice(7).trim();
  if (!token) {
    throw new Response('Unauthorized', { status: 401 });
  }
  try {
    const decoded = await auth.verifyIdToken(token);
    console.log('[auth] decoded token', decoded);
    return decoded;
  } catch {
    throw new Response('Unauthorized', { status: 401 });
  }
}

/**
 * Checks per-user and global rate limits (30/user/24h, 1000 global/24h).
 * Order: global first, then per-user.
 *
 * @throws Response with status 429 and JSON body { error, detail, retryAfter } if either limit exceeded
 */
export async function checkRateLimit(uid: string): Promise<void> {
  const globalRes = await globalLimiter.limit('app');
  if (!globalRes.success) {
    throw new Response(
      JSON.stringify({
        error: 'RateLimitExceeded',
        detail: `App daily request limit reached (${RATE_LIMIT_GLOBAL_PER_DAY}/day).`,
        retryAfter: retryAfterSeconds(globalRes.reset),
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const userRes = await userLimiter.limit(uid);
  if (!userRes.success) {
    throw new Response(
      JSON.stringify({
        error: 'RateLimitExceeded',
        detail: `You have reached your daily request limit (${RATE_LIMIT_USER_PER_DAY}/day).`,
        retryAfter: retryAfterSeconds(userRes.reset),
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Verifies the request token and enforces rate limits, then returns the decoded user.
 * Use this at the top of protected routes.
 */
export async function authenticate(req: Request): Promise<admin.auth.DecodedIdToken> {
  const user = await verifyToken(req);
  await checkRateLimit(user.uid);
  return user;
}
