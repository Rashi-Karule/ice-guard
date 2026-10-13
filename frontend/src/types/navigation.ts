// types/navigation.ts

export interface Waypoint {
  lat: number;
  lon: number;
  name: string;
}

export interface RouteOption {
  id: "route_baseline" | "route_safest" | "route_balanced";
  name: string;
  distance_nm: number;
  eta_hours: number;
  fuel_tons: number;
  ice_hazard_score: number;
  iceberg_clusters_in_path: number;
  pack_ice_thickness_m: number;
  risk_level: "High" | "Very Low" | "Low-Moderate";
  path?: [number, number][];
}

export interface RoutesResponse {
  mission: string;
  start: Waypoint;
  destination: Waypoint;
  routes: RouteOption[];
}

export interface EvaluationResponse {
  recommended_route_id: string;
  reasoning_summary: string;
  critical_hazards: string[];
  voyage_tradeoffs: {
    fuel_saved_tons: number;
    time_penalty_hours: number;
    ice_risk: string;
  };
  officer_briefing: string;
}
