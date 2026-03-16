# Auth & Rate Limiter Implementation Plan

## Background

Next.js middleware runs in the Edge Runtime, which does not support Node.js APIs. `firebase-admin` depends on Node's `crypto` and `net`, so it cannot be used in `middleware.ts`. The solution is to skip middleware entirely for auth and rate limiting, and instead use shared helper functions called at the top of each route handler.

No new middleware file. No `jose` or additional libraries beyond what's already in the project.

---

## Architecture

Two helper functions, called in sequence at the top of every protected route:

```
verifyToken(req)  →  decoded user (DecodedIdToken)
        ↓
checkRateLimit(userId)  →  void (throws if limit exceeded)
```

A thin `authenticate(req)` wrapper calls both and returns the decoded user — one line for most routes.

All helpers live in `backend/lib/auth.ts`.

---

## Phase 1: Auth — `verifyToken`

### What it does

Extracts the Firebase ID token from the `Authorization: Bearer <token>` header and verifies it using `firebase-admin`. Returns the decoded token (which contains `uid`, `email`, etc.) on success, or throws a `401` response on failure.

### Firebase Admin initialization

`firebase-admin` must be initialized once and reused across requests (Next.js module caching handles this). The service account credentials come from an existing environment variable.

**File:** `backend/lib/firebase-admin.ts`

```ts
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!)
    ),
  });
}

export default admin;
```

### `verifyToken` signature

```ts
// backend/lib/auth.ts
export async function verifyToken(req: Request): Promise<admin.auth.DecodedIdToken>
```

- Reads `Authorization` header
- Strips `Bearer ` prefix
- Calls `admin.auth().verifyIdToken(token)`
- Throws `new Response('Unauthorized', { status: 401 })` on any failure (missing header, invalid token, expired token)
- Returns `DecodedIdToken` on success

### Mobile app — sending the token (Phase 1 frontend)

Every API request from `mobile-app` must include the token in the `Authorization` header.

The pattern in `src/utils/aiService.ts` (and any other file making backend calls):

```ts
import { getAuth } from 'firebase/auth';

async function getAuthHeader(): Promise<{ Authorization: string }> {
  const token = await getAuth().currentUser?.getIdToken();
  if (!token) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${token}` };
}

// Usage in every fetch call:
const headers = await getAuthHeader();
const res = await fetch(`${BACKEND_URL}/api/agent`, {
  method: 'POST',
  headers: { ...headers, 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
```

Firebase ID tokens expire after 1 hour. `getIdToken()` automatically refreshes the token if needed — no manual refresh logic required.

### Route usage (Phase 1)

```ts
// backend/app/api/agent/route.ts
import { verifyToken } from '@/lib/auth';

export async function POST(req: Request) {
  const user = await verifyToken(req);
  // user.uid is now available
  // ... rest of handler
}
```

---

## Phase 2: Rate Limiting — `checkRateLimit`

### Storage: Upstash Redis over HTTP

Upstash Redis uses `fetch` under the hood — fully compatible with the Node.js runtime used in route handlers. Environment variables are already set.

**No new library needed** — use `@upstash/redis` which is already available, or raw `fetch` calls to the Upstash REST API if preferred.

### Strategy: Fixed window per user

- Window: 60 seconds
- Limit: TBD (suggested: 20 requests/min for AI routes, 60 requests/min for lighter routes)
- Key: `rate_limit:{userId}`
- Storage: Upstash Redis — increment counter with TTL on first request in window

### `checkRateLimit` signature

```ts
// backend/lib/auth.ts
export async function checkRateLimit(
  userId: string,
  options?: { limit?: number; windowSeconds?: number }
): Promise<void>
```

- Increments `rate_limit:{userId}` in Redis with `INCR`
- On first increment (result === 1), sets TTL with `EXPIRE`
- If count exceeds limit, throws `new Response('Too Many Requests', { status: 429 })`
- Returns `void` on success

### `authenticate` convenience wrapper

```ts
export async function authenticate(req: Request): Promise<admin.auth.DecodedIdToken> {
  const user = await verifyToken(req);
  await checkRateLimit(user.uid);
  return user;
}
```

### Route usage (Phase 2)

```ts
// backend/app/api/agent/route.ts
import { authenticate } from '@/lib/auth';

export async function POST(req: Request) {
  const user = await authenticate(req);
  // user.uid available, rate limit enforced
  // ... rest of handler
}
```

Routes that need a custom limit (e.g., lighter endpoints):

```ts
const user = await verifyToken(req);
await checkRateLimit(user.uid, { limit: 60, windowSeconds: 60 });
```

---

## File Checklist

| File | Action |
|------|--------|
| `backend/lib/firebase-admin.ts` | Create — singleton admin init |
| `backend/lib/auth.ts` | Create — `verifyToken`, `checkRateLimit`, `authenticate` |
| `backend/app/api/*/route.ts` | Update — add `authenticate(req)` call at top of each handler (8 routes) |
| `mobile-app/src/utils/aiService.ts` | Update — add `Authorization` header to all backend fetch calls |
| `mobile-app/src/utils/*.ts` | Update — any other files making backend requests |
| `backend/.env.local` | Verify — `FIREBASE_SERVICE_ACCOUNT_KEY` and Upstash env vars exist |

---

## Error Response Contract

| Scenario | HTTP Status | Response Body |
|----------|-------------|---------------|
| Missing `Authorization` header | 401 | `Unauthorized` |
| Invalid or expired token | 401 | `Unauthorized` |
| Rate limit exceeded | 429 | `Too Many Requests` |

The mobile app should handle 401 by triggering a re-authentication flow, and 429 by surfacing a user-facing error message.
