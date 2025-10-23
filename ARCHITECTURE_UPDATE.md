# Architecture Update: Vercel Serverless Backend

## Summary of Changes

We're restructuring the project to use a **Vercel serverless backend** for all AI features instead of calling AI directly from the React Native mobile app.

## Folder Restructure

### Old Structure (Current)

```
Week 2 - Mobile Messaging App/
├── src/                    # React Native app
├── App.js
├── package.json
└── ...
```

### New Structure (Target)

```
Week 2 - Mobile Messaging App/
├── mobile-app/             # React Native/Expo app
│   ├── src/
│   ├── App.js
│   ├── package.json
│   └── .env
├── backend/                # Vercel serverless functions
│   ├── app/
│   │   └── api/           # Serverless function routes
│   │       ├── test/
│   │       │   └── route.ts
│   │       ├── summarize/
│   │       │   └── route.ts
│   │       ├── extract-actions/
│   │       │   └── route.ts
│   │       ├── search/
│   │       │   └── route.ts
│   │       ├── priority/
│   │       │   └── route.ts
│   │       ├── decisions/
│   │       │   └── route.ts
│   │       └── agent/
│   │           └── route.ts
│   ├── lib/               # Shared utilities
│   │   └── firebase-admin.ts
│   ├── .env.local
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   └── vercel.json
└── memory-bank/
```

## Migration Steps

### Step 1: Create Backend Folder (PR #11.5)

1. Move existing code to `mobile-app/` folder
2. Create `backend/` folder with Next.js structure
3. Deploy test function to Vercel
4. Verify mobile app can call backend

### Step 2: Update AI PRs (#12-14)

Instead of implementing AI in the mobile app, we:

1. Build Vercel serverless functions for each AI feature
2. Deploy to Vercel
3. Mobile app calls backend via HTTP API

## Key Benefits

1. **Security**: OpenAI API key never exposed to mobile clients
2. **Scalability**: Backend and mobile scale independently
3. **Rate Limiting**: Server-side control of AI usage
4. **Timeout Safety**: 60s timeout vs 30s (Edge)
5. **Flexibility**: Switch AI providers without mobile app update

## Updated PR Structure

- **PR #1-11**: Core messaging (unchanged)
- **PR #11.5**: Vercel Backend Setup & Test Function (NEW)
- **PR #12**: AI Backend - Thread Summarization & Action Items (UPDATED)
- **PR #13**: AI Backend - Smart Search & Priority Detection (UPDATED)
- **PR #14**: AI Backend - Decision Tracking & Multi-Step Agent (UPDATED)
- **PR #15**: Typing Indicators & Connection Status (unchanged)
- **PR #16**: Dark Mode & Message Reactions (unchanged)
- **PR #17**: AI Features Polish & Integration (UPDATED)

## Cost & Performance

- **Vercel Free Tier**: 100k requests/day (sufficient for testing/demo)
- **Latency**: +100-300ms vs direct calls (negligible compared to AI processing time)
- **Cold Start**: 200-500ms first request, then warm
- **Total AI Request Time**: 2.5-3s (vs 2-2.5s direct) - acceptable

## Next Steps

1. ✅ Update PRD.md (DONE)
2. ⏳ Update tasks.md AI PRs
3. ⏳ Create migration guide
4. ⏳ Start PR #11.5 implementation
