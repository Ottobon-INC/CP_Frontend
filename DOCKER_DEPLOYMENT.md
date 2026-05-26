> Synced with current codebase on 2026-05-26.
> Canonical doc status: see `docs/DOCUMENTATION_STATUS.md`.

# Frontend Docker Deployment

## Build-time variables
- `VITE_API_BASE_URL` is compile-time; rebuilding is required after changes.

## Standard deploy flow
```bash
cd frontend
cp .env.example .env
# set VITE_API_BASE_URL
docker compose up -d --build
```

## Verify
```bash
docker compose ps
docker compose logs -f frontend
```

## Runtime notes
- Frontend is a static SPA build served by nginx.
- Ensure backend CORS allows the deployed frontend origin.
- OAuth login in frontend resolves backend URL using `buildApiUrl('/auth/google')`, so `VITE_API_BASE_URL` must point to the backend service origin.

## Troubleshooting
- Config changed but UI still old: rebuild (`docker compose up -d --build`).
- API calls failing: verify `VITE_API_BASE_URL` and backend reachability.
- SPA deep link 404: verify nginx config includes SPA fallback to `index.html`.
