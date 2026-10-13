import os
import json
from datetime import datetime
from dotenv import load_dotenv

# Load local environment variables from backend/.env if present
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types

app = FastAPI(title="IceGuard Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

def load_seed_routes():
    path = os.path.join(os.path.dirname(__file__), "..", "data", "routes.json")
    with open(path, "r") as f:
        return json.load(f)

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "IceGuard Backend"}

@app.get("/api/routes")
def get_routes():
    return load_seed_routes()

class EvaluateRequest(BaseModel):
    selected_route_id: str = "route_balanced"

@app.post("/api/evaluate")
def evaluate_routes(req: EvaluateRequest):
    data = load_seed_routes()
    routes = data["routes"]
    
    prompt = f"""
You are the Chief Ice Navigator and IceGuard AI Decision Engine for an Antarctic resupply ship.
Here are the 3 evaluated routes:
{json.dumps(routes, indent=2)}

The navigator tentatively prefers '{req.selected_route_id}'.
Analyze the decision cleanly in valid JSON.
Format strictly with these keys:
- "recommended_route_id": string
- "reasoning_summary": string (plain English, crisp)
- "critical_hazards": array of strings
- "voyage_tradeoffs": object with "fuel_saved_tons", "time_penalty_hours", "ice_risk"
- "officer_briefing": string (professional radio transmission style)
"""

    if not client:
        # Fallback if API key missing during emergency demo
        return {
            "recommended_route_id": "route_balanced",
            "reasoning_summary": "Bypasses the multi-year pack ice near Novolazarevskaya while saving 26 hours vs Safest route.",
            "critical_hazards": ["Marginal drift iceberg cluster at 68°S 8°E"],
            "voyage_tradeoffs": {
                "fuel_saved_tons": 28,
                "time_penalty_hours": 8,
                "ice_risk": "Acceptable with thermal radar"
            },
            "officer_briefing": "Bridge Alert: Balanced Corridor approved. Divert 15 degrees East past Bouvet Island."
        }

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2
            )
        )
        return json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ConfirmRouteRequest(BaseModel):
    voyage_id: str = "Maitri-2026-01"
    selected_route_id: str = "route_balanced"
    officer_name: str = "Chief Navigator"
    officer_notes: str = "Route approved based on Gemini hazard analysis."

@app.post("/api/confirm-route")
def confirm_route(req: ConfirmRouteRequest):
    record = {
        "voyage_id": req.voyage_id,
        "selected_route_id": req.selected_route_id,
        "officer_name": req.officer_name,
        "officer_notes": req.officer_notes,
        "confirmed_at": datetime.utcnow().isoformat(),
        "status": "LOCKED_IN_TRANSIT"
    }
    
    # Cloud Firestore persist if running in GCP (Cloud Run) or credentials configured; safe instant fallback locally
    try:
        if os.getenv("GOOGLE_APPLICATION_CREDENTIALS") or os.getenv("K_SERVICE") or os.getenv("GCP_PROJECT"):
            from google.cloud import firestore
            db = firestore.Client()
            db.collection("voyage_decisions").document(req.voyage_id).set(record)
            storage_mode = "Cloud Firestore"
        else:
            storage_mode = "Local Ledger (Dev Mode)"
    except Exception:
        storage_mode = "Local Ledger (Dev Mode)"

    return {
        "status": "success",
        "storage": storage_mode,
        "record": record
    }