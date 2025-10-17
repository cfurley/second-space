Second Space — frontend README

Overview
--------
This folder contains the React/Vite frontend for Second Space. The code has
been organized to be approachable for a developer new to the project:

- `src/contexts/AuthContext.tsx` — central auth state and simple mock implementations
- `src/containers/AuthGate.tsx` — shows login UI when unauthenticated
- `src/containers/MainLayout.tsx` — primary app layout (Header, Sidebar, Content)
- `src/components/*` — UI components and small widgets
- `src/utils/validators.ts` — username/password validation logic used by create account

Auth flow (developer-friendly)
-----------------------------
- The app is wrapped with `AuthProvider` in `main.tsx`. That provider exposes
  `login`, `logout`, and `createAccount` and a boolean `isAuthenticated`.
- `App.tsx` composes `AuthGate` and `MainLayout`. `AuthGate` renders `Login`
  when `isAuthenticated` is false.
- At the moment the provider uses mock implementations (accept any login).
  Replace those with real API calls to the auth microserver when available.

Where to change for real auth
----------------------------
- Replace the implementations in `src/contexts/AuthContext.tsx` with fetch calls
  to your backend microserver (for example: POST /auth/login and POST /users).
- Move validators into the backend too for server-side validation.

Running locally
---------------
- Use the repository's Docker Compose (recommended) or `npm run dev` inside
  `frontend/` to run the Vite dev server.
