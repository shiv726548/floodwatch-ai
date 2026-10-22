# FloodWatch AI

FloodWatch AI is a disaster coordination prototype for geolocated flood and landslide response intelligence. It is designed as a decision-support dashboard and is not a real emergency dispatch system.

## Repository structure

- `frontend/` - React + TypeScript + Vite + Tailwind dashboard
- `backend/` - FastAPI backend with SQLite + SQLAlchemy-ready scaffolding and route graph logic
- `docs/` - design system notes and data-source limitations
- `.env.example` - environment template

## Phase summary

- Phase 1: project scaffolding, dark ops shell, map layout, simulated incident data
- Phase 2: closure-aware routing graph, route comparison, no-safe-route handling
- Phase 3: healthcare coordination, priority rules, resource status, roles and audit concept
- Phase 4: AI modules with graceful fallback, image classification, duplicate detection, confidence labels
- Phase 5: guided demo mode, automated tests, evaluation page, README and limitations

## Run locally

### Frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Environment variables

Copy `.env.example` to `.env` and update as needed.

## Limitations

This prototype is decision support only. It does not dispatch teams, guarantee safe routes, or replace official authorities.

## Data sources and limitations

The app is intentionally simulated and documents source limitations. See `docs/data-sources-limitations.md` and `docs/design-system.md`.
