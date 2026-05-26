# Frontend App

React + Vite + wouter application for:
- marketing pages
- course details and registration
- unified course player (cohort + on-demand)
- student dashboard modules

## Start
```bash
cd frontend
npm install
npm run dev
```

## Environment

- `VITE_API_BASE_URL` (default: `http://localhost:4000`)

API URL generation is centralized via `src/lib/api.ts` (`buildApiUrl`).

## Route highlights

- `/course/:id` and `/course/:id/learn/:lesson`
- `/ondemand/:id` and `/ondemand/:id/learn/:lesson`
- `/registration/*`
- `/student-dashboard` plus dashboard tabs (`/my-courses`, `/assignments`, `/messages`, etc.)

## Important behavior

- Navbar is hidden on player and registration routes.
- OAuth login redirects through backend `/auth/google`.
- Course player supports:
  - module/topic sidebar navigation
  - quiz launch/submit lifecycle
  - assignment mode per module
  - cohort project modal in cohort mode

## Canonical docs

- [docs/DOCUMENTATION_STATUS.md](/mnt/d/bunny/ottobon%20projects/course%20platform%20working/docs/DOCUMENTATION_STATUS.md)
- [LLM required extra docs/api-contracts.md](/mnt/d/bunny/ottobon%20projects/course%20platform%20working/LLM%20required%20extra%20docs/api-contracts.md)
- [frontend/DOCKER_DEPLOYMENT.md](/mnt/d/bunny/ottobon%20projects/course%20platform%20working/frontend/DOCKER_DEPLOYMENT.md)
