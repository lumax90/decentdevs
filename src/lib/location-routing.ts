import { heroMapLocations, type HeroLocationId } from './hero-destinations';

export type MapPoint = readonly [number, number, number];
export const LOCATION_DWELL_SECONDS = 1.35;
export const LOCATION_CAPTURE_ANGLE = 0.20;

const locations = new Map(heroMapLocations.map(location => [location.id, location]));

export function locationPoint(id: HeroLocationId): MapPoint {
  return locations.get(id)!.position;
}

export function angularDistance(a: MapPoint, b: MapPoint) {
  const length = Math.hypot(...a) * Math.hypot(...b);
  if (!length) return Math.PI;
  return Math.acos(Math.max(-1, Math.min(1, (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / length)));
}

export function closestLocation(point: MapPoint, excluded: readonly HeroLocationId[] = []) {
  let best: { location: HeroLocationId; angle: number } | null = null;
  for (const location of heroMapLocations) {
    if (excluded.includes(location.id)) continue;
    const angle = angularDistance(point, location.position);
    if (!best || angle < best.angle) best = { location: location.id, angle };
  }
  return best;
}

export function planNearbyStop(from: HeroLocationId | MapPoint, visited: readonly HeroLocationId[] = []) {
  const current = typeof from === 'string' ? from : null;
  const point = typeof from === 'string' ? locationPoint(from) : from;
  let history = [...new Set([...visited, ...(current ? [current] : [])])];
  let next = closestLocation(point, history);
  if (!next) {
    history = current ? [current] : [];
    next = closestLocation(point, history);
  }
  return { location: next!.location, visited: history };
}

export function createLocationDwell() {
  return { candidate: null as HeroLocationId | null, elapsed: 0, fired: false };
}
export type LocationDwell = ReturnType<typeof createLocationDwell>;

export function stepLocationDwell(state: LocationDwell, candidate: HeroLocationId | null, dt: number, stable: boolean) {
  if (!stable || !candidate) {
    state.candidate = null; state.elapsed = 0; state.fired = false;
    return false;
  }
  if (candidate !== state.candidate) { state.candidate = candidate; state.elapsed = 0; state.fired = false; }
  state.elapsed += Math.min(dt, 0.05);
  if (state.elapsed < LOCATION_DWELL_SECONDS || state.fired) return false;
  state.fired = true;
  return true;
}
