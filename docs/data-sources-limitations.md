# FloodWatch AI

FloodWatch AI is a disaster coordination prototype for geolocated flood and landslide response intelligence. It is built as a decision-support dashboard, not a real emergency dispatch system.

## Repository structure

- `frontend/` - React + TypeScript + Vite + Tailwind dashboard
- `backend/` - FastAPI backend with SQLite + SQLAlchemy foundation
- `docs/` - design system, limitations, and data-source notes
- `.env.example` - environment template

## Phase 1 status

This phase delivers:
- project scaffolding
- dark-mode dashboard shell
- Leaflet map with simulated incident markers
- incident feed and status cards
- seed data and backend mock API

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

## Design tokens

- Dark mode default
- navy/slate surfaces with teal accent
- semantic status colors for open/reported/closure/access-uncertain/outdated
- Inter + JetBrains Mono typography
- rounded cards and glass panels

## Limitations

This prototype is for simulated decision support only. It never guarantees route safety, does not dispatch teams, and does not replace official authorities.

## Data sources and limitations

The app includes documented simulated data sources and notes. See `docs/data-sources-limitations.md`.
