# Growth OS Frontend

Growth OS is a web-based growth studio for creating, refining, and launching performance-driven ads and content. This repository contains the frontend app only; the backend lives in a separate private repository.

## Overview

The frontend is built with:

- React 18
- Vite
- Tailwind CSS
- Firebase Authentication and Firestore
- RevenueCat subscription readiness
- React Router for navigation
- React Flow for workflow visualization

The app provides a glass-style studio experience for:

- importing and analyzing creative assets
- transcribing and polishing scripts
- generating voiceovers with text-to-speech
- managing workspace content and downloads
- building automated workflows
- tracking growth metrics and subscription status

## What’s included

- `package.json` - frontend dependencies and scripts
- `src/` - React source code
- `src/App.jsx` - app shell, routing, sidebar, layout, and protected routes
- `src/main.jsx` - React entrypoint
- `src/firebase/` - Firebase auth and Firestore data sync
- `src/services/` - external API clients and RevenueCat support
- `src/pages/` - Dashboard, Transcribe, TTS, Download, Workspace, Knowledge, Workflows, Pricing, Settings, and auth demo pages
- `src/components/` - reusable UI components, command palette, sidebar, protected route wrapper, and more
- `src/context/` - theme, profile, preferences, and feature flag providers
- `src/hooks/` - utility hooks such as swipe navigation and dynamic text color

## Core app flows

Growth OS frontend is designed around these core experiences:

- Dashboard: growth insights, usage summaries, and quota status
- Inspiration Vault / Download: import competitor clips or source media
- Script Refinery / Transcribe: transcribe audio/video and polish scripts
- Voice Studio / TTS: generate AI voiceovers and preview audio
- Workspace: save scripts, downloads, and generated assets
- Knowledge: user context, reference data, and prompt history
- Workflows: visual automation builder and saved workflow library
- Pricing: subscription plans with RevenueCat integration
- Settings: profile, preferences, themes, and account details

## Prerequisites

- Node.js 16+ and npm
- Firebase project with Authentication + Firestore enabled
- Backend API available at `VITE_API_BASE_URL`
- (Optional) Stripe / RevenueCat for paid plans and subscriptions

## Local setup

From the frontend root:

```bash
cd /Users/voldimonz/Documents/MILENDE COLLECTIVE INC./apps/growth_os_app/frontend
npm install
```

Create `frontend/.env` with values for your environment:

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

## Run commands

Start the dev server:

```bash
npm run dev
```

Build the app:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Integration details

### Firebase

- `src/firebase/AuthContext.jsx` manages authentication state, Firestore profile sync, and subscription sync
- `src/firebase/firestoreService.js` includes preference and subscription persistence
- Firebase data is used for user preferences, subscription metadata, settings, and context state

### Backend API

The frontend depends on a private backend API for:

- transcription (`/transcribe`)
- text modifications (`/modify`)
- TTS generation (`/tts`)
- downloads and media import (`/download`, `/downloads/*`)
- workspace and workflow CRUD (`/workspace`, `/workflows`)
- analytics and quota data (`/analytics`, `/credits/*`)
- pricing data and subscription status

Auth headers and local identifiers are set in `src/lib/apiClient.js`.

### Subscription readiness

The app includes RevenueCat integration support in `src/services/revenueCat.js` and displays live plan state on the Pricing page.

## Pages and routes

Routes defined in `src/App.jsx`:

- `/dashboard`
- `/transcribe`
- `/tts`
- `/download`
- `/workspace`
- `/knowledge`
- `/workflows`
- `/pricing`
- `/settings`
- `/auth-demo`

The root `/` redirects to `/dashboard`.

## Notes

- This repository only contains the frontend.
- The private backend repo must be available and reachable via `VITE_API_BASE_URL`.
- If the backend is not running, many features will still render but may fail when fetching data.
- Keep `node_modules/` out of source control and use `.gitignore` to exclude build artifacts.

## Helpful docs

See these files for setup and launch references:

- `FIREBASE_SETUP.md`
- `SETUP_GUIDE.md`
- `LAUNCH_GUIDE.md`

## Suggestions

- Configure Firebase Auth with email/password or social sign-in providers
- Use a secure backend URL in production
- Add `.env.example` if you want to share sample config values without secrets
