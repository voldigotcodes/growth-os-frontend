# Growth OS Frontend

This repository contains the Growth OS frontend application, built with React, Vite, Tailwind CSS, and Firebase.

> The backend services are maintained in a separate private repository and are not included here.

## Project Overview

Growth OS is a full-stack application composed of a public frontend (this repo) and a private backend service. The two parts work together to provide an end-to-end experience for users:

- **Frontend (this repo):** Fast, responsive React app (Vite + Tailwind) handling UI, authentication (Firebase Auth), workflow visualization, and calls to backend APIs. Primary source files live under `frontend/src/`.
- **Backend (private repo):** FastAPI (Uvicorn) services that implement the application API surface (transcription, text modification, TTS, workspace & workflows management, analytics, credits, etc.), subscription and payment logic (RevenueCat, Stripe), and server-side Firestore access via the `firebase-admin` SDK.
- **Data & integrations:** Firebase Firestore is used for user profiles, workspace and workflow persistence; RevenueCat and Stripe manage subscriptions/payments; object/audio storage and third-party services (speech, TTS) are orchestrated by the backend.

How they interact:

- The frontend calls the backend API configured via `VITE_API_BASE_URL` (set in `frontend/.env`). Common API endpoints used by the UI are implemented in `frontend/src/lib/apiClient.js`.
- Backend endpoints validate Firebase ID tokens, perform server-side processing, and update Firestore and third-party services as needed.

Running locally:

- Start the backend (private repository) and ensure its `VITE_API_BASE_URL` (or equivalent) is reachable at the value used in the frontend env.
- Then run the frontend development server:

```bash
cd frontend
npm install
npm run dev
```

Notes for contributors:

- This README focuses on the frontend; backend sources and deployment workflows are maintained in a private repository. Coordinate API or schema changes with the backend team and update `frontend/src/lib/apiClient.js` and the env docs when contracts change.

## What’s included

- `frontend/` - React app with Vite, Tailwind, Firebase integration, RevenueCat readiness, and glass-style UI components.
- `frontend/package.json` - frontend dependencies and scripts.
- `frontend/src/` - React source code, including Firebase helpers, routes, hooks, services, and UI components.
- `FIREBASE_SETUP.md`, `SETUP_GUIDE.md`, `LAUNCH_GUIDE.md` - supporting docs for frontend integration and local launch.

## Prerequisites

- macOS/Linux/Windows
- Node.js 16+ and npm
- Firebase project with Firestore enabled
- Optional: Stripe and RevenueCat for subscription flows

## Local setup

1. Install frontend dependencies:

```bash
cd frontend
npm install
```

2. Create a frontend environment file at `frontend/.env` and set your Firebase and API values:

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

> The backend API URL is typically a local or private backend instance. Update `VITE_API_BASE_URL` to the correct backend endpoint.

## Running the frontend

```bash
cd frontend
npm run dev
```

Build for production:

```bash
cd frontend
npm run build
```

Preview a production build:

```bash
cd frontend
npm run preview
```

## Frontend features

- React 18 with Vite for fast development and build performance
- Tailwind CSS for design and glass UI styling
- Firebase authentication and Firestore integration
- RevenueCat-ready subscription support
- React Router DOM for client-side routing
- React Flow for workflow visualization

## Frontend structure

- `frontend/src/App.jsx` - main app entry point
- `frontend/src/main.jsx` - React bootstrap file
- `frontend/src/firebase/` - Firebase initialization and helpers
- `frontend/src/components/` - reusable UI components
- `frontend/src/hooks/` - custom React hooks
- `frontend/src/pages/` - page views and routes
- `frontend/src/services/` - API and integration services

## Notes

- This README is focused on the frontend app only.
- Backend integration is handled in a separate private repository.
- If you update frontend dependencies, run `npm install` from `frontend/`.
- Use `FIREBASE_SETUP.md` and `SETUP_GUIDE.md` for configuration details.
