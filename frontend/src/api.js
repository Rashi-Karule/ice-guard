import { API, FORCE_MOCK } from './config';
import { getMockScene, getMockAdvice, getMockDecisionResponse } from './mock';

/**
 * Fetch ice scene from /scene or /api/scene, with automatic fallback to mock data.
 * @returns {Promise<{ data: any, isMock: boolean }>}
 */
export async function getScene() {
  if (FORCE_MOCK) {
    return { data: getMockScene(), isMock: true };
  }

  try {
    const res = await fetch(`${API}/scene`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return { data, isMock: false };
  } catch (err) {
    console.warn('API /scene unavailable, using mock data:', err);
    return { data: getMockScene(), isMock: true };
  }
}

/**
 * Fetch route recommendations from /api/routes + /api/evaluate, or /advise.
 * @param {[number, number]} start [lat, lon]
 * @param {[number, number]} end [lat, lon]
 * @returns {Promise<{ data: any, isMock: boolean }>}
 */
export async function getAdvice(start, end) {
  if (FORCE_MOCK) {
    return { data: getMockAdvice(start, end), isMock: true };
  }

  // 1. Try FastAPI backend endpoints (/api/routes + /api/evaluate)
  try {
    const routesRes = await fetch(`${API}/api/routes`);
    if (routesRes.ok) {
      const routesData = await routesRes.json();
      let evalData = {};
      try {
        const evalRes = await fetch(`${API}/api/evaluate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selected_route_id: 'route_safest' }),
        });
        if (evalRes.ok) evalData = await evalRes.json();
      } catch (e) {
        console.warn('Evaluation endpoint unavailable:', e);
      }
      return { data: { ...routesData, ...evalData }, isMock: false };
    }
  } catch (e) {
    // Fall back to /advise
  }

  // 2. Try legacy /advise endpoint
  try {
    const res = await fetch(`${API}/advise`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start_lat: start[0],
        start_lon: start[1],
        end_lat: end[0],
        end_lon: end[1],
      }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return { data, isMock: false };
  } catch (err) {
    console.warn('API route endpoints unavailable, using mock data:', err);
    return { data: getMockAdvice(start, end), isMock: true };
  }
}

/**
 * Log navigator decision to /decision.
 * If backend fails, flags as local-only for graceful resilience.
 * @param {object} payload
 * @returns {Promise<{ ok: boolean, id?: string, localOnly: boolean }>}
 */
export async function postDecision(payload) {
  if (FORCE_MOCK) {
    const mockRes = getMockDecisionResponse();
    return { ...mockRes, localOnly: false };
  }

  try {
    const res = await fetch(`${API}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return { ok: true, id: data.id, localOnly: false };
  } catch (err) {
    console.warn('API /decision unavailable, recording locally:', err);
    return { ok: false, localOnly: true };
  }
}
