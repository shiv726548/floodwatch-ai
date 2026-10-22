from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any

app = FastAPI(title="FloodWatch AI API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Incident(BaseModel):
    id: str
    title: str
    category: str
    severity: str
    status: str
    confidence: float
    source: str
    freshness_minutes: int
    lat: float
    lng: float
    description: str


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok", "service": "FloodWatch AI backend"}


@app.get("/api/dashboard")
def dashboard() -> Dict[str, Any]:
    return {
        "banner": "Simulated demo data — not real emergency information. In a real emergency contact official services.",
        "summary": {
            "activeWarnings": 3,
            "roadBlocks": 2,
            "medicalRequests": 4,
            "reliefCenters": 5,
        },
        "incidents": [
            {
                "id": "INC-1001",
                "title": "Flooding near River Road",
                "category": "Flood",
                "severity": "High",
                "status": "Awaiting verification",
                "confidence": 0.82,
                "source": "Public report",
                "freshness": "12 min ago",
                "lat": 23.0225,
                "lng": 72.5714,
                "description": "Standing water reported over half the carriageway after intense rainfall.",
            },
            {
                "id": "INC-1002",
                "title": "Landslide warning on Hill Link Road",
                "category": "Landslide",
                "severity": "Medium",
                "status": "Reported hazard",
                "confidence": 0.71,
                "source": "Model prediction",
                "freshness": "19 min ago",
                "lat": 23.0284,
                "lng": 72.5657,
                "description": "Loose debris and soil slip observed near the road shoulder.",
            },
            {
                "id": "INC-1003",
                "title": "Bridge access partially open",
                "category": "Road",
                "severity": "Low",
                "status": "Open according to available information",
                "confidence": 0.64,
                "source": "Officially confirmed",
                "freshness": "27 min ago",
                "lat": 23.0305,
                "lng": 72.5798,
                "description": "Single-lane access remains open with caution; no safe guarantee.",
            },
        ],
    }


@app.get("/api/incidents")
def list_incidents() -> List[Incident]:
    return [
        Incident(
            id="INC-1001",
            title="Flooding near River Road",
            category="Flood",
            severity="High",
            status="Awaiting verification",
            confidence=0.82,
            source="Public report",
            freshness_minutes=12,
            lat=23.0225,
            lng=72.5714,
            description="Standing water reported over half the carriageway after intense rainfall.",
        ),
        Incident(
            id="INC-1002",
            title="Landslide warning on Hill Link Road",
            category="Landslide",
            severity="Medium",
            status="Reported hazard",
            confidence=0.71,
            source="Model prediction",
            freshness_minutes=19,
            lat=23.0284,
            lng=72.5657,
            description="Loose debris and soil slip observed near the road shoulder.",
        ),
    ]


@app.get("/api/seed")
def seed_demo() -> Dict[str, str]:
    return {"status": "ok", "message": "Demo data loaded for Phase 1"}
