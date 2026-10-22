# FloodWatch AI

FloodWatch AI is a disaster coordination prototype for monitoring flood and landslide reports, road accessibility, assistance requests, and relief resources in a single operations dashboard.

## Phase 1 status

This initial phase delivers the project scaffolding, dark-mode dashboard shell, Leaflet map, incident reporting form, and seeded demo data. It is designed to be extended through later phases for routing, requests, AI, and evaluation.

## Repository structure

- `frontend/` - React + TypeScript + Vite + Tailwind + Leaflet dashboard
- `backend/` - FastAPI API backend with SQLite and SQLAlchemy foundation
- `docs/` - design and source documentation
- `.env.example` - environment template
- `README.md` - run guide and limitations

## Design tokens

- Dark mode default, with calm slate/navy surfaces
- Accent: teal / electric blue
- Semantic states: red, amber, green, purple/orange, grey
- Typography: Inter + JetBrains Mono
- Radius: 12–16px, 8px spacing grid
- Card styling: floating panels, soft shadows, map-first layout

## Quick start

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

### Environment

Copy `.env.example` to `.env` and update the values as needed.

## Limitations

This prototype is for decision support only and does not dispatch teams or guarantee safe routes. It is a simulation, not real emergency information. In a real emergency, contact local official authorities.
