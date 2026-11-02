# Growth OS Frontend

React 18 application for the Growth OS content studio, built with Vite, Tailwind CSS, Firebase, and React Flow. It provides dashboards, media downloads, transcription, script editing, text-to-speech, a workspace, and visual workflows. Subscription screens integrate with RevenueCat and backend billing endpoints.

The FastAPI backend lives in a separate repository and must run for API-backed features. Firebase handles browser authentication and Firestore access.

## Local setup

Use Node.js 22 and npm. Run commands from **this repository's root** (the `frontend/` directory when both repositories sit inside `growth_os_app/`):

```sh
npm ci
```

Create `.env` in that directory:

```dotenv
VITE_API_BASE_URL=http://localhost:8001
```

Start the backend separately on port 8001 using its README, then start the frontend:

```sh
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`. Restart Vite after changing `.env`. Without `VITE_API_BASE_URL`, API clients fall back to `http://localhost:8000`; set it explicitly to avoid reaching another local application.

## Firebase and subscriptions

Firebase configuration currently lives directly in `src/firebase/firebaseConfig.js`. For your own Firebase project, update that configuration, enable the sign-in methods you use, configure Firestore rules, and authorize your frontend domain in Firebase Authentication. The current initializer does **not** read `VITE_FIREBASE_*` variables from `.env`.

`src/services/revenueCat.js` contains the current RevenueCat sandbox integration. Review its configuration and backend billing setup before enabling purchases. Vite exposes every `VITE_*` value to the browser: use public client configuration only; private billing keys and service-account credentials belong on the backend.

The code has two API clients: `apiClient.js` uses local user/session identifiers, while `apiClientFirebase.js` attaches Firebase tokens when available. The backend currently uses client-provided user IDs for attribution; signing in does not by itself establish authorization across every API route.

## Commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install dependencies from the committed lockfile |
| `npm run dev` | Start Vite with hot reload |
| `npm run build` | Build the production application into `dist/` |
| `npm run preview` | Preview the production build locally |

There is currently no automated test or lint script in `package.json`.

## Source layout

| Path | Purpose |
| --- | --- |
| `src/App.jsx`, `src/main.jsx` | Routes and application bootstrap |
| `src/pages/` | Dashboard, downloads, transcription, TTS, workspace, workflows, pricing, and settings |
| `src/components/` | Shared UI and workflow editor components |
| `src/context/`, `src/hooks/` | Application state and reusable behavior |
| `src/firebase/` | Firebase initialization, auth, and Firestore helpers |
| `src/lib/apiClient.js`, `src/lib/apiClientFirebase.js` | Backend request clients |
| `src/services/revenueCat.js` | Subscription integration |
| `src/styles/`, `src/index.css` | Application styling |

See [README-GLASS.md](README-GLASS.md) for the glass UI components.

## Verify and troubleshoot

- Check `http://localhost:8001/health` and `http://localhost:8001/openapi.json`. The schema title must be **Growth OS API**. Another app can return a healthy response while serving unrelated endpoints.
- For failed requests, inspect the browser Network panel for the destination URL, HTTP status, and response. Confirm the API port matches `.env`, then restart Vite.
- If Firebase sign-in fails, check the configured project, enabled providers, and authorized domain. For Firestore errors, inspect the project's access rules.
- API-backed tools require the backend's provider keys and dependencies even if the frontend renders successfully.

For deployment, set `VITE_API_BASE_URL` to the backend's HTTPS URL **before building**; Vite embeds it in the output. Configure the host to serve `index.html` for client-side routes, authorize the deployed domain in Firebase, and configure backend CORS for that origin. Keep `.env`, `node_modules/`, and `dist/` out of Git; commit dependency lockfiles.
