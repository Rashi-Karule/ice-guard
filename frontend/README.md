# IceGuard — Antarctic Resupply Decision Support

Antarctic maritime navigation decision-support frontend built for Team Paradox (hackathon demo).
Powered by Google Maps Platform, Gemini via Vertex AI, and Earth Engine / Sentinel-1 SAR ice data.

---

## Quickstart

### 1. Environment Setup
Copy `.env.example` to `.env` and specify your Google Maps JavaScript API key:
```bash
cp .env.example .env
```
Inside `frontend/.env`:
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 2. Development Server
Install dependencies and run the local development server:
```bash
npm install
npm run dev
```
Open `http://localhost:5173/?mock=1` to run with built-in mock data for testing before the backend is deployed.

### 3. Production Build
Build the distribution bundle for deployment to Google Cloud Run:
```bash
npm run build
```
Output files will be generated in `frontend/dist/`.

---

## Backend API Contract

The frontend expects a FastAPI / Cloud Run backend serving these endpoints from the same origin:

### 1. `GET /scene`
Supplies sea ice concentrations and iceberg hazard zones:
```json
{
  "ice": [[-62.15, 3.25, 0.42], ...],
  "bergs": [{"lat": -64.6, "lon": 7.8}],
  "dlat": -0.17,
  "dlon": 0.34,
  "meta": {
    "source": "Sentinel-1 SAR (Earth Engine)",
    "updated": "2026-10-13T08:00:00Z",
    "synthetic": false
  }
}
```

### 2. `POST /advise`
Computes candidate transit routes and delivers Gemini's tactical recommendation:
- **Body**: `{ "start_lat": -61.0, "start_lon": 2.0, "end_lat": -69.0, "end_lon": 18.0 }`
- **Response**:
```json
{
  "routes": [
    {
      "name": "baseline",
      "distance_km": 1420,
      "ice_exposure_km": 385,
      "eta_hours": 58.0,
      "iceberg_risk_cells": 12,
      "path": [[-61.0, 2.0], ...]
    },
    { "name": "balanced", ... },
    { "name": "safest", ... }
  ],
  "advice": "Recommended: safest route...\nAvoid high-strain pack ice...",
  "confidence": 0.94
}
```

### 3. `POST /decision`
Logs human navigator accept or manual override decisions to Firestore:
- **Body**:
```json
{
  "decision": "accepted",
  "route": "safest",
  "start": [-61.0, 2.0],
  "end": [-69.0, 18.0],
  "advice_excerpt": "Recommended: safest route...",
  "timestamp": "2026-10-13T10:45:00Z"
}
```
- **Response**: `{ "ok": true, "id": "dec_948f21" }`
