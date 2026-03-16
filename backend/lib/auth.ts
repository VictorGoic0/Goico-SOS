import type admin from 'firebase-admin';
import { auth } from './firebase-admin';

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
    return decoded;
  } catch {
    throw new Response('Unauthorized', { status: 401 });
  }
}
