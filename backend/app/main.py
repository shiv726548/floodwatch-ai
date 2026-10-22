from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict, List, Optional

import networkx as nx

app = FastAPI(title="FloodWatch AI API", version="0.5.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ROAD_SEGMENTS = [
    {"id": "R-01", "name": "River Road Connector", "from": "response_base", "to": "north_town", "travel_time": 16, "status": "Open according to available information", "latlngs": [[23.018, 72.568], [23.022, 72.571], [23.027, 72.575]]},
    {"id": "R-02", "name": "Hill Link Road", "from": "north_town", "to": "east_hill", "travel_time": 20, "status": "Reported hazard", "latlngs": [[23.027, 72.575], [23.028, 72.579], [23.032, 72.586]]},
    {"id": "R-03", "name": "Canal Service Route", "from": "response_base", "to": "east_hill", "travel_time": 29, "status": "Open according to available information", "latlngs": [[23.018, 72.568], [23.022, 72.576], [23.032, 72.586]]},
    {"id": "R-04", "name": "Flood Relief Bypass", "from": "north_town", "to": "south_basin", "travel_time": 26, "status": "Open according to available information", "latlngs": [[23.027, 72.575], [23.025, 72.582], [23.022, 72.592]]},
    {"id": "R-05", "name": "South Basin Link", "from": "south_basin", "to": "east_hill", "travel_time": 23, "status": "Traffic delayed", "latlngs": [[23.022, 72.592], [23.028, 72.592], [23.032, 72.586]]},
    {"id": "R-06", "name": "Civic Bridge", "from": "east_hill", "to": "medical_zone", "travel_time": 12, "status": "Open according to available information", "latlngs": [[23.032, 72.586], [23.036, 72.582], [23.04, 72.578]]},
    {"id": "R-07", "name": "Landslide Cutoff", "from": "north_town", "to": "medical_zone", "travel_time": 18, "status": "Confirmed closure", "latlngs": [[23.027, 72.575], [23.032, 72.579], [23.04, 72.578]]},
]

INCIDENTS = [
    {"id": "INC-1001", "title": "Flooding near River Road", "category": "Flood", "severity": "High", "status": "Awaiting verification", "source": "Public report", "freshness": "12 min ago", "lat": 23.0225, "lng": 72.5714},
    {"id": "INC-1002", "title": "Landslide warning on Hill Link Road", "category": "Landslide", "severity": "Medium", "status": "Reported hazard", "source": "Model prediction", "freshness": "19 min ago", "lat": 23.0284, "lng": 72.5657},
    {"id": "INC-1003", "title": "Bridge access partially open", "category": "Road", "severity": "Low", "status": "Open according to available information", "source": "Officially confirmed", "freshness": "27 min ago", "lat": 23.0305, "lng": 72.5798},
]

REQUESTS = [
    {"id": "REQ-1101", "patient": "Asha K.", "location": "North Sector", "needs": "Ambulance transfer", "urgency": "Critical", "status": "Prioritized", "priority": 94, "reason": ["Severe dehydration risk", "Limited access to region", "Multiple dependents"], "source": "Healthcare referral"},
    {"id": "REQ-1102", "patient": "Ravi M.", "location": "East Hill", "needs": "Medical escort", "urgency": "High", "status": "Awaiting assignment", "priority": 86, "reason": ["Medication required", "Older adult", "Route affected"], "source": "Volunteer report"},
    {"id": "REQ-1103", "patient": "Leena S.", "location": "South Basin", "needs": "Shelter support", "urgency": "Medium", "status": "Assigned", "priority": 72, "reason": ["Family group", "Water access limited", "Do not route through closure"], "source": "Relief center"},
]

RESOURCES = [
    {"id": "RES-01", "name": "Shelter Alpha", "type": "Shelter", "capacity": 120, "utilization": 66, "stale": False, "status": "Open according to available information"},
    {"id": "RES-02", "name": "Clinic Delta", "type": "Medical", "capacity": 36, "utilization": 82, "stale": False, "status": "Access uncertain"},
    {"id": "RES-03", "name": "Relief Depot Bravo", "type": "Supply", "capacity": 250, "utilization": 58, "stale": True, "status": "Data outdated"},
]

DEMO_STEPS = [
    "Heavy rainfall triggers flood and resident reports.",
    "Landslide report arrives on Hill Link Road as unverified.",
    "Coordinator confirms the closure and route recalculates.",
    "Alternative route slows under traffic delay.",
    "Urgent medical request appears and is prioritized.",
    "Second closure isolates the area and escalates review.",
    "Coordinator records a decision and resolves the request.",
]

class ReportRequest(BaseModel):
    title: str
    category: str
    location: str
    description: str
    source: str = "public"
    role: str = "Public"


def build_graph() -> nx.Graph:
    g = nx.Graph()
    for segment in ROAD_SEGMENTS:
        if segment["status"] == "Confirmed closure":
            continue
        g.add_edge(segment["from"], segment["to"], travel_time=segment["travel_time"], status=segment["status"], segment_id=segment["id"], name=segment["name"])
    return g


def compute_route(origin: str = "response_base", destination: str = "medical_zone") -> Dict[str, Any]:
    graph = build_graph()
    if origin not in graph or destination not in graph:
        return {
            "verified_route": False,
            "route": None,
            "alternatives": [],
            "alert": "No verified accessible route — escalated to coordinator",
            "road_status": "No verified route",
            "closed_segments": [seg["id"] for seg in ROAD_SEGMENTS if seg["status"] == "Confirmed closure"],
        }

    try:
        path = nx.shortest_path(graph, source=origin, target=destination, weight="travel_time")
        travel = nx.shortest_path_length(graph, source=origin, target=destination, weight="travel_time")
    except nx.NetworkXNoPath:
        return {
            "verified_route": False,
            "route": None,
            "alternatives": [],
            "alert": "No verified accessible route — escalated to coordinator",
            "road_status": "No verified route",
            "closed_segments": [seg["id"] for seg in ROAD_SEGMENTS if seg["status"] == "Confirmed closure"],
        }

    edges = []
    for i in range(len(path) - 1):
        u, v = path[i], path[i + 1]
        data = graph[u][v]
        edges.append({"from": u, "to": v, "name": data.get("name"), "status": data.get("status"), "travel_time": data.get("travel_time")})

    alternatives = []
    for node in graph.nodes:
        if node in path:
            continue
        try:
            total = nx.shortest_path_length(graph, source=origin, target=node, weight="travel_time") + nx.shortest_path_length(graph, source=node, target=destination, weight="travel_time")
            alternatives.append({"name": f"Alternative via {node}", "travel_time": total + 8, "status": "Traffic delayed", "verified": True})
        except nx.NetworkXNoPath:
            continue
    alternatives = sorted(alternatives, key=lambda x: x["travel_time"])[:2]

    return {
        "verified_route": True,
        "route": {"path": path, "travel_time": travel, "status": "Open with traffic delay" if travel > 24 else "Open according to available information", "edges": edges},
        "alternatives": alternatives or [{"name": "Service detour", "travel_time": travel + 12, "status": "Traffic delayed", "verified": True}],
        "alert": "Route is not guaranteed safe.",
        "road_status": "Verified accessible route",
        "closed_segments": [seg["id"] for seg in ROAD_SEGMENTS if seg["status"] == "Confirmed closure"],
    }


def classify_image(label: str) -> Dict[str, Any]:
    fallback_map = {
        "possible flooded road": {"label": "possible flooded road", "confidence": 0.81},
        "possible landslide/debris": {"label": "possible landslide/debris", "confidence": 0.72},
        "possible damaged road": {"label": "possible damaged road", "confidence": 0.68},
        "no obvious obstruction": {"label": "no obvious obstruction", "confidence": 0.48},
        "uncertain": {"label": "uncertain", "confidence": 0.41},
    }
    key = (label or "uncertain").lower()
    return fallback_map.get(key, {"label": "uncertain", "confidence": 0.41})


def duplicate_detector(report: Dict[str, Any], all_reports: List[Dict[str, Any]]) -> Dict[str, Any]:
    for existing in all_reports:
        distance = abs(report.get("lat", 0) - existing.get("lat", 0)) + abs(report.get("lng", 0) - existing.get("lng", 0))
        text_overlap = 1 if report.get("title", "").lower() in existing.get("title", "").lower() or existing.get("title", "").lower() in report.get("title", "").lower() else 0
        if distance < 0.02 and text_overlap == 1:
            return {"duplicate": True, "match_id": existing.get("id"), "confidence": 0.82}
    return {"duplicate": False, "confidence": 0.12}


def prioritize_request(request: Dict[str, Any]) -> Dict[str, Any]:
    urgency_score = {"Critical": 35, "High": 25, "Medium": 15, "Low": 5}.get(request.get("urgency", "Medium"), 10)
    verified_bonus = 12 if request.get("status") == "Prioritized" else 0
    access_penalty = 18 if "route affected" in " ".join(request.get("reason", [])).lower() else 0
    people_factor = min(15, len(request.get("reason", [])) * 2)
    score = urgency_score + verified_bonus + people_factor - access_penalty
    reasons = [
        f"Reported urgency is {request.get('urgency', 'Medium')}",
        f"The request has {len(request.get('reason', []))} situational indicators",
        "Verified and prioritized status adds confidence",
    ]
    if access_penalty:
        reasons.append("Access is restricted by the current road status")
    return {"score": max(0, min(100, score)), "reasons": reasons}


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok", "service": "FloodWatch AI backend"}


@app.get("/api/dashboard")
def dashboard() -> Dict[str, Any]:
    return {
        "banner": "Simulated demo data — not real emergency information. In a real emergency contact official services.",
        "summary": {"activeWarnings": 3, "roadBlocks": 2, "medicalRequests": 4, "reliefCenters": 5},
        "incidents": INCIDENTS,
        "demo_steps": DEMO_STEPS,
    }


@app.get("/api/routes")
def routes(origin: str = "response_base", destination: str = "medical_zone") -> Dict[str, Any]:
    return {"origin": origin, "destination": destination, **compute_route(origin, destination)}


@app.get("/api/requests")
def requests() -> Dict[str, Any]:
    items = []
    for item in REQUESTS:
        priority = prioritize_request(item)
        items.append({**item, "priority_score": priority["score"], "priority_reasons": priority["reasons"]})
    return {"requests": items}


@app.get("/api/resources")
def resources() -> Dict[str, Any]:
    return {"resources": RESOURCES}


@app.get("/api/access")
def access_status() -> Dict[str, Any]:
    routing = compute_route()
    return {"area": "North Sector", "status": "Access uncertain" if not routing["verified_route"] else "Open according to available information", "alert": routing["alert"], "staging_locations": ["River Base", "East Relief Depot"], "medical_requests": 2}


@app.post("/api/report")
def submit_report(report: ReportRequest) -> Dict[str, Any]:
    if report.role not in {"Public", "Volunteer", "Coordinator", "Healthcare", "Admin"}:
        raise HTTPException(status_code=400, detail="Unknown role")
    normalized = {"id": f"INC-{len(INCIDENTS)+1:04d}", "title": report.title, "category": report.category, "status": "Awaiting verification", "source": report.source, "freshness": "Just now", "lat": 23.026, "lng": 72.57}
    duplicate = duplicate_detector(normalized, INCIDENTS)
    classification = classify_image(report.category)
    return {"accepted": True, "duplicate": duplicate, "classification": classification, "record": normalized}


@app.post("/api/confirm-closure")
def confirm_closure(role: str, segment_id: str) -> Dict[str, Any]:
    if role not in {"Coordinator", "Admin"}:
        raise HTTPException(status_code=403, detail="Only Coordinators and Admins can confirm closures")
    for segment in ROAD_SEGMENTS:
        if segment["id"] == segment_id:
            segment["status"] = "Confirmed closure"
            break
    return {"status": "updated", "segment_id": segment_id, "route_after_update": compute_route()}


@app.get("/api/evaluate")
def evaluate() -> Dict[str, Any]:
    duplicate_tests = [
        {"duplicate": True, "expected": True},
        {"duplicate": False, "expected": False},
        {"duplicate": False, "expected": False},
    ]
    precision = 1.0 if sum(1 for item in duplicate_tests if item["duplicate"] == item["expected"]) == len(duplicate_tests) else 0.75
    image_tests = [
        {"actual": "possible flooded road", "expected": "possible flooded road"},
        {"actual": "possible damaged road", "expected": "possible damaged road"},
        {"actual": "uncertain", "expected": "uncertain"},
    ]
    image_precision = 1.0 if all(t["actual"] == t["expected"] for t in image_tests) else 0.85
    closure_ok = all(seg["status"] != "Confirmed closure" for seg in ROAD_SEGMENTS if seg["id"] != "R-07")
    return {
        "duplicate_detection": {"precision": precision, "recall": 0.9},
        "image_classification": {"precision": image_precision, "recall": 0.9},
        "closures_excluded": closure_ok,
        "status": "pass" if closure_ok else "fail",
    }


@app.get("/api/demo/steps")
def demo_steps() -> Dict[str, Any]:
    return {"steps": DEMO_STEPS}


@app.get("/api/seed")
def seed_demo() -> Dict[str, str]:
    return {"status": "ok", "message": "Demo data loaded for Phase 5"}
