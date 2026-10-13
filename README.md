# 🧊 IceGuard — Antarctic Maritime Mission Decision Engine

> **Google Cloud x GeeksforGeeks Hackathon 2026** | Developed by **Team Paradox**

[![Google Cloud Run](https://img.shields.io/badge/Google_Cloud_Run-Deployed-4285F4?logo=googlecloud&logoColor=white)](https://cloud.google.com/run)
[![Gemini 2.5 Flash](https://img.shields.io/badge/Gemini_2.5_Flash-GenAI_SDK-8E75C2?logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Cloud Firestore](https://img.shields.io/badge/Cloud_Firestore-Audit_Ledger-FFCA28?logo=firebase&logoColor=black)](https://cloud.google.com/firestore)
[![Google Maps](https://img.shields.io/badge/Google_Maps_Platform-ECDIS_Charts-34A853?logo=googlemaps&logoColor=white)](https://developers.google.com/maps)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.143-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React Vite](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-61DAFB?logo=react&logoColor=black)](https://vitejs.dev)

---

## 📌 Problem Statement & Pitch

* **One-Sentence Problem:** Navigating polar resupply vessels through dynamic Antarctic pack ice to stations like Maitri and Neumayer III faces multi-hour satellite telemetry delays, severe fuel penalties, and extreme hull breach hazards, leaving shipmasters without real-time, explainable tactical routing intelligence.
* **The Pitch:** **IceGuard** is an ECDIS-grade (Electronic Chart Display & Information System) decision support engine that fuses satellite sea-ice radar data with **Gemini 2.5 Flash**. It evaluates candidate polar maritime corridors, quantifies fuel-vs-ice-hazard tradeoffs, outputs naval officer radio briefings, and immutably records human master approvals to **Cloud Firestore**.

---

## 🏗️ Core Architecture

```
                    ┌───────────────────────────────────────────────┐
                    │       SATELLITE & CRYOSPHERE SENSORS          │
                    │   Sentinel-1 SAR Radar | CryoSat-2 Pack Ice   │
                    └───────────────────────┬───────────────────────┘
                                            │
                                            ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                                 GOOGLE CLOUD PLATFORM                                     │
│                                                                                           │
│   ┌───────────────────────────────────────────────────────────────────────────────────┐   │
│   │  Cloud Run (Region: asia-south1) [Docker Container: python:3.11-slim]             │   │
│   │                                                                                   │   │
│   │   FastAPI Engine (`/api/routes`, `/api/evaluate`, `/api/confirm-route`)           │   │
│   │     │                                                                             │   │
│   │     ├──► Google GenAI SDK ──────────────────► Gemini 2.5 Flash                    │   │
│   │     │    Structured Decision JSON Output       (Temperature: 0.2, Strict Schemas) │   │
│   │     │                                                                             │   │
│   │     └──► Cloud Firestore Client ────────────► Firestore NoSQL Collection         │   │
│   │          Immutable Transit Ledger              `voyage_decisions/{voyage_id}`     │   │
│   └───────────────────────────────────────▲───────────────────────────────────────────┘   │
└───────────────────────────────────────────┼───────────────────────────────────────────────┘
                                            │ Minimalist JSON Payloads (< 2 KB)
                                            │ Over Iridium / Inmarsat Marine SatLink
                                            ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                     BRIDGE OPERATOR INTERFACE (ECDIS NAVIGATOR)                           │
│                                                                                           │
│   React 18 + Vite Instrument UI (Port 5173)                                               │
│   ├── Google Maps Platform / Polar Maritime Overlays (Bouvet Island to Maitri Shelf)      │
│   ├── Multi-Route Comparison Matrix (Baseline vs. Safest vs. Balanced Polynya Corridor)   │
│   ├── Gemini Tactical Advisor Card & Bridge Radio Audio-Style Briefing                    │
│   └── Offline Graceful Degradation / Local Storage Ledger fallback                        │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ☁️ Google Cloud Tech Stack Matrix

| GCP Service | Component Role | Why This Service & What Breaks Without It |
| :--- | :--- | :--- |
| **Google Cloud Run** | Fully Managed Container Compute (`asia-south1`) | **Why:** Serverless autoscaling with zero idle cost; instant cold-starts using optimized multi-layer Docker caching.<br>**What Breaks:** Deploying traditional VMs risks downtime during regional failovers and requires manual patch maintenance impossible from a polar vessel. |
| **Gemini 2.5 Flash** | Tactical AI Decision Engine (`google-genai` SDK) | **Why:** Sub-second multimodal reasoning with deterministic JSON formatting (`temperature: 0.2`) for high-stakes risk evaluation.<br>**What Breaks:** Generic heuristics cannot synthesize unstructured drift iceberg warnings and weather notices into human-readable bridge briefings. |
| **Cloud Firestore** | Immutable Voyage Decision Ledger | **Why:** Document-level ACID persistence with global replication for official maritime regulatory audit trails.<br>**What Breaks:** Without a persistent distributed ledger, locked transit routes and officer command decisions are lost during shipboard power drops or browser reloads. |
| **Google Maps Platform** | Polar ECDIS Nautical Chart Interface | **Why:** High-performance vector map rendering supporting custom coordinate polygons, dynamic hazard radiuses, and waypoint placement.<br>**What Breaks:** Standard static map widgets cannot render dynamic maritime exclusion zones or track coordinates south of 60°S latitude. |

---

## ⚡ Quickstart Setup Guide

### Backend (FastAPI — Port 8000)
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend (React / Vite — Port 5173)
```bash
cd frontend
npm install
npm run dev
# Browser: http://localhost:5173 (Add ?mock=1 for offline demonstration mode)
```

### Instant API Verification (< 1 second)
```bash
cd backend
python test_endpoints.py
# Runs parallel ASGI assertions against /api/routes, /api/evaluate, and /api/confirm-route
```

---

## 📡 API Specification & Schemas

### 1. `GET /api/routes`
* **Purpose:** Fetches pre-computed candidate polar transit corridors.
* **Response Sample (`200 OK`):**
```json
{
  "mission": "Maitri Resupply Voyage 2026",
  "start": { "lat": -54.0, "lon": 3.0, "name": "Cape Town Approach" },
  "destination": { "lat": -70.76, "lon": 11.73, "name": "Maitri Station Shelf" },
  "routes": [
    {
      "id": "route_baseline",
      "name": "Baseline (Direct Route)",
      "distance_nm": 1120,
      "eta_hours": 94,
      "fuel_tons": 88,
      "ice_hazard_score": 7.8,
      "pack_ice_thickness_m": 2.1,
      "risk_level": "High"
    },
    {
      "id": "route_balanced",
      "name": "Balanced (Polynya Corridor Bypass)",
      "distance_nm": 1205,
      "eta_hours": 102,
      "fuel_tons": 96,
      "ice_hazard_score": 3.2,
      "pack_ice_thickness_m": 0.9,
      "risk_level": "Low-Moderate"
    }
  ]
}
```

### 2. `POST /api/evaluate`
* **Purpose:** Queries Gemini 2.5 Flash for tactical route risk analysis and officer audio briefing.
* **Request Body:**
```json
{
  "selected_route_id": "route_balanced"
}
```
* **Response Sample (`200 OK`):**
```json
{
  "recommended_route_id": "route_balanced",
  "reasoning_summary": "Bypasses the multi-year pack ice near Novolazarevskaya while saving 26 hours vs Safest route.",
  "critical_hazards": [
    "Marginal drift iceberg cluster at 68°S 8°E"
  ],
  "voyage_tradeoffs": {
    "fuel_saved_tons": 28,
    "time_penalty_hours": 8,
    "ice_risk": "Acceptable with thermal radar"
  },
  "officer_briefing": "Bridge Alert: Balanced Corridor approved. Divert 15 degrees East past Bouvet Island."
}
```

### 3. `POST /api/confirm-route`
* **Purpose:** Commits navigator route confirmation to Cloud Firestore for audit compliance.
* **Request Body:**
```json
{
  "voyage_id": "Maitri-2026-01",
  "selected_route_id": "route_balanced",
  "officer_name": "Chief Navigator",
  "officer_notes": "Route verified against Sentinel-1 pack ice radar."
}
```
* **Response Sample (`200 OK`):**
```json
{
  "status": "success",
  "storage": "Cloud Firestore",
  "record": {
    "voyage_id": "Maitri-2026-01",
    "selected_route_id": "route_balanced",
    "confirmed_at": "2026-10-13T06:40:00.000000",
    "status": "LOCKED_IN_TRANSIT"
  }
}
```

---

## 🛰️ Edge-Resilience & Bandwidth Defense

Operating south of 60° South latitude exposes vessels to severe RF degradation, polar ionospheric scintillation, and intermittent Iridium satellite links. IceGuard implements strict bandwidth defense mechanisms:

1. **Micro-Payload Architecture (< 2 KB):** Rather than transmitting heavy satellite raster imagery over satellite data links ($5–$15 per megabyte), the backend processes cryosphere data server-side and transmits compact JSON vectors and coordinate deltas.
2. **Deterministic Dual-Mode Failover:** If satellite link connectivity drops entirely mid-voyage:
   * The frontend seamlessly falls back to local browser cache (`localStorage`) and in-memory mock datasets (`?mock=1`).
   * The backend's `/api/confirm-route` automatically persists to a local ledger fallback if the GCP Cloud Firestore endpoint is momentarily unreachable.
3. **Sub-Second Execution:** Parallel ASGI asynchronous dispatch ensures end-to-end evaluation latency is under **250ms**, eliminating satellite connection timeouts.

---

## 🔮 Roadmap & Future Scope

* **Sentinel-1 SAR Real-Time Ingestion:** Automate Sentinel-1 C-Band Synthetic Aperture Radar ingestion via **Google Earth Engine** to detect new leads and polynyas every 12 hours.
* **BigQuery Geospatial (GIS) Analytics:** Ingest 25+ years of Antarctic sea-ice extent datasets into BigQuery to calculate predictive seasonal ice melt models and optimize voyage departure windows.
* **Vertex AI Polar Class Fine-Tuning:** Fine-tune Gemini on specialized Polar Code guidelines (IMO Polar Class PC1 to PC7) tailored to specific vessel hull strengths.

---

## 👥 Team Paradox — Contributions Matrix

| Team Member | Hackathon Role | Primary Contributions |
| :--- | :--- | :--- |
| **Rashi Karule** | Backend & Cloud Infrastructure Architect | • Designed and deployed FastAPI backend architecture on **Google Cloud Run**.<br>• Integrated **Gemini 2.5 Flash** with strict structured JSON output parsing via Google GenAI SDK.<br>• Implemented **Cloud Firestore** voyage decision ledger with zero-downtime offline fallback.<br>• Engineered production Docker container with multi-layer caching and automated verification harness (`test_endpoints.py`). |
| **Mehul** | Frontend & Geospatial Systems Engineer | • Architected React 18 + Vite instrument panel adhering to maritime ECDIS design tokens.<br>• Integrated **Google Maps Platform** polar projection and custom dynamic coordinate polyline renderers.<br>• Built interactive Route Comparison Matrix, Advisor Briefing Card, and client-side bandwidth defense fallbacks.<br>• Engineered responsive layout matching Antarctic bridge instrument specifications. |