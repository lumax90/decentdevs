import { Euler, MathUtils, Quaternion, Vector3 } from 'three';
import { heroMapLocations, type HeroLocationId } from '@/lib/hero-destinations';
import { stopMomentum, type OrbitMotion } from './state';
export { createMotion, stopMomentum, type OrbitMotion } from './state';

export const PLANET_SCALE = 2.25;
export const GAIT_DISTANCE = 0.44;
export const initialOrientation = new Quaternion().setFromEuler(new Euler(0.1, 0.5, 0));
export const landingNormal = new Vector3(0, 0.97, 0.24).normalize();
const inverseInitial = initialOrientation.clone().invert();
export const destinationNormals = Object.fromEntries(heroMapLocations.map(destination => [
  destination.id, new Vector3(...destination.position).normalize().applyQuaternion(inverseInitial),
])) as Record<HeroLocationId, Vector3>;

export function createGlobeMotion() {
  return {
    orientation: initialOrientation.clone(), goal: new Quaternion(), delta: new Quaternion(),
    angular: new Vector3(), point: new Vector3(), revision: -1, distance: Infinity,
  };
}
export type GlobeMotion = ReturnType<typeof createGlobeMotion>;

export function stepGlobe(globe: GlobeMotion, m: OrbitMotion, dt: number, playing: boolean, reduced: boolean, screenUp: Vector3) {
  m.time += dt;
  let snap = false;
  if (globe.revision !== m.revision) {
    globe.revision = m.revision;
    m.arrived = false;
    if (m.destination) {
      globe.point.copy(destinationNormals[m.destination]).applyQuaternion(globe.orientation);
      globe.goal.setFromUnitVectors(globe.point, screenUp).multiply(globe.orientation).normalize();
      // A deliberate selection remains usable without animation.
      if (reduced) { globe.orientation.copy(globe.goal); snap = true; }
    }
  }

  if (!playing || reduced) {
    stopMomentum(m);
    return snap;
  }
  if (m.destination && !m.dragging) {
    globe.distance = globe.orientation.angleTo(globe.goal);
    const speed = Math.min(0.72, globe.distance * 2.1);
    globe.orientation.rotateTowards(globe.goal, speed * dt);
    if (globe.distance < 0.002) globe.orientation.copy(globe.goal);
    return false;
  }

  if (m.dragging) {
    m.planetVelocity += (90 * (m.dragTarget - m.planetAngle) - 18 * m.planetVelocity) * dt;
    m.pitchVelocity += (70 * (m.pitchTarget - m.pitchAngle) - 17 * m.pitchVelocity) * dt;
  } else {
    m.planetVelocity = MathUtils.damp(m.planetVelocity, 0, 6, dt);
    m.pitchVelocity = MathUtils.damp(m.pitchVelocity, 0, 6, dt);
  }
  m.planetVelocity = MathUtils.clamp(m.planetVelocity, -1.15, 1.15);
  m.pitchVelocity = MathUtils.clamp(m.pitchVelocity, -0.55, 0.55);
  m.planetAngle += m.planetVelocity * dt;
  m.pitchAngle += m.pitchVelocity * dt;
  globe.angular.set(m.pitchVelocity, m.planetVelocity * 0.45, -m.planetVelocity);
  const speed = globe.angular.length();
  if (speed > 1e-8) {
    globe.delta.setFromAxisAngle(globe.angular.multiplyScalar(1 / speed), speed * dt);
    globe.orientation.premultiply(globe.delta).normalize();
  }
  return false;
}

export function createSurfaceMotion() {
  return {
    current: new Vector3(0, 1, 0), target: new Vector3(0, 1, 0), velocity: new Vector3(),
    error: new Vector3(), worldNormal: new Vector3(), worldVelocity: new Vector3(),
    inverse: new Quaternion(), initialized: false,
  };
}
export type SurfaceMotion = ReturnType<typeof createSurfaceMotion>;

export function stepSurface(s: SurfaceMotion, m: OrbitMotion, rotation: Quaternion, screenUp: Vector3, dt: number, paused: boolean, snap = false) {
  s.inverse.copy(rotation).invert();
  s.target.copy(screenUp).applyQuaternion(s.inverse).normalize();
  if (!s.initialized || snap) {
    s.current.copy(s.target);
    s.velocity.set(0, 0, 0);
    s.initialized = true;
  }
  if (paused || snap) {
    s.velocity.set(0, 0, 0);
    s.worldVelocity.set(0, 0, 0);
    s.worldNormal.copy(s.current).applyQuaternion(rotation);
    m.characterVelocity = 0;
    m.activity = snap ? 0 : MathUtils.damp(m.activity, 0, 10, dt);
    return;
  }
  const cosine = MathUtils.clamp(s.current.dot(s.target), -1, 1);
  const angle = Math.acos(cosine);
  s.error.copy(s.target).addScaledVector(s.current, -cosine);
  if (s.error.lengthSq() > 1e-12) s.error.normalize().multiplyScalar(angle);
  s.velocity.addScaledVector(s.error, 48 * dt).multiplyScalar(Math.exp(-11 * dt));
  s.velocity.addScaledVector(s.current, -s.velocity.dot(s.current));
  s.current.addScaledVector(s.velocity, dt).normalize();
  s.velocity.addScaledVector(s.current, -s.velocity.dot(s.current));
  s.worldNormal.copy(s.current).applyQuaternion(rotation);
  s.worldVelocity.copy(s.velocity).applyQuaternion(rotation);
  const speed = s.velocity.length();
  if (Math.abs(s.worldVelocity.x) > 0.012) m.direction = Math.sign(s.worldVelocity.x);
  m.characterVelocity = speed * m.direction;
  m.activity = MathUtils.damp(m.activity, MathUtils.smoothstep(speed, 0.004, 0.022), 9, dt);
  m.phase += speed * PLANET_SCALE / GAIT_DISTANCE * Math.PI * 2 * dt;
}

export interface SurfaceMap { width: number; height: number; radii: number[] }

export function surfaceRadius(surface: SurfaceMap, normal: Vector3) {
  const u = ((Math.atan2(normal.x, normal.z) / (2 * Math.PI)) % 1 + 1) % 1 * surface.width;
  const v = Math.acos(MathUtils.clamp(normal.y, -1, 1)) / Math.PI * (surface.height - 1);
  const x0 = Math.floor(u), x1 = (x0 + 1) % surface.width;
  const y0 = Math.floor(v), y1 = Math.min(y0 + 1, surface.height - 1);
  const tx = u - x0, ty = v - y0;
  const a = MathUtils.lerp(surface.radii[y0 * surface.width + x0], surface.radii[y0 * surface.width + x1], tx);
  const b = MathUtils.lerp(surface.radii[y1 * surface.width + x0], surface.radii[y1 * surface.width + x1], tx);
  return MathUtils.lerp(a, b, ty);
}
