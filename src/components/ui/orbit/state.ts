import type { HeroLocationId } from '@/lib/hero-destinations';

// This lightweight state is shared with the UI. Three.js stays in the lazy
// scene chunk, so the headline and project links can render immediately.
export function createMotion() {
  return {
    time: 0, planetAngle: 0, planetVelocity: 0, dragTarget: 0,
    pitchAngle: 0, pitchVelocity: 0, pitchTarget: 0,
    characterVelocity: 0, phase: 0, activity: 0, direction: 1,
    heading: 0, cameraHeading: 0, dragging: false, lastInteraction: -4,
    destination: null as HeroLocationId | null, revision: 0, arrived: false,
    mapPoint: [0, 1, 0] as [number, number, number],
    hoveredLocation: null as HeroLocationId | null,
    nearbyLocation: null as HeroLocationId | null,
    dismissedLocation: null as HeroLocationId | null,
    dwellProgress: 0,
    dwellAtFeet: false,
  };
}
export type OrbitMotion = ReturnType<typeof createMotion>;

export function stopMomentum(motion: OrbitMotion) {
  motion.dragging = false;
  motion.planetVelocity = motion.pitchVelocity = 0;
  motion.dragTarget = motion.planetAngle;
  motion.pitchTarget = motion.pitchAngle;
}
