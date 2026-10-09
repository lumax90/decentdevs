'use client';

import { useMemo, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, Group, MathUtils, Quaternion, Vector3 } from 'three';
import { heroMapLocations, type HeroLocationId } from '@/lib/hero-destinations';
import { initialOrientation, PLANET_SCALE, surfaceRadius, type OrbitMotion, type SurfaceMap } from './motion';

type Bounds = { left: number; right: number; top: number; bottom: number };
const intersects = (a: Bounds, b: Bounds) => a.left < b.right + 10 && a.right + 10 > b.left && a.top < b.bottom + 8 && a.bottom + 8 > b.top;
const out = new Vector3(0, 0, 1);
const inverseInitial = initialOrientation.clone().invert();

interface MapLocationsProps {
  surface: SurfaceMap;
  orientation: Quaternion;
  centerY: number;
  labels: RefObject<(HTMLButtonElement | null)[]>;
  runner: RefObject<Group | null>;
  selected: HeroLocationId | null;
  reduced: boolean;
  motion: RefObject<OrbitMotion>;
}

export function MapLocations({ surface, orientation, centerY, labels, runner, selected, reduced, motion }: MapLocationsProps) {
  const locations = useMemo(() => heroMapLocations.map((location, index) => {
    const normal = new Vector3(...location.position).applyQuaternion(inverseInitial).normalize();
    const radius = surfaceRadius(surface, normal) * PLANET_SCALE + 0.022;
    const height = location.kind === 'destination' ? 0.185 : 0.14;
    return {
      ...location, index, normal, radius, height,
      position: normal.clone().multiplyScalar(radius),
      rotation: new Quaternion().setFromUnitVectors(out, normal),
      x: 0, y: 0, depth: 0, opacity: 0, targetOpacity: 0, score: 0,
      bounds: { left: 0, right: 0, top: 0, bottom: 0 },
    };
  }), [surface]);
  const frame = useMemo(() => ({
    normal: new Vector3(), point: new Vector3(), cameraFront: new Vector3(), feet: new Vector3(), head: new Vector3(),
    candidates: [...locations], occupied: [] as Bounds[],
    actorBounds: { left: 0, right: 0, top: 0, bottom: 0 },
  }), [locations]);

  useFrame(({ camera, size }, delta) => {
    frame.cameraFront.set(0, 0, 1).applyQuaternion(camera.quaternion);
    if (runner.current) {
      frame.feet.copy(runner.current.position);
      frame.head.copy(frame.feet).multiplyScalar(1 + 0.83 / Math.max(frame.feet.length(), 1));
      frame.feet.y += centerY;
      frame.head.y += centerY;
      frame.feet.project(camera);
      frame.head.project(camera);
      const x = (frame.feet.x * 0.5 + 0.5) * size.width;
      frame.actorBounds.left = x - 27;
      frame.actorBounds.right = x + 27;
      frame.actorBounds.top = (-frame.head.y * 0.5 + 0.5) * size.height - 5;
      frame.actorBounds.bottom = (-frame.feet.y * 0.5 + 0.5) * size.height + 5;
    }

    for (const location of locations) {
      const active = location.id === selected || location.id === motion.current.nearbyLocation && motion.current.dwellAtFeet;
      frame.normal.copy(location.normal).applyQuaternion(orientation);
      location.depth = frame.normal.dot(frame.cameraFront);
      frame.point.copy(frame.normal).multiplyScalar(location.radius + (active ? 0 : location.height));
      frame.point.y += centerY;
      frame.point.project(camera);
      // The arrival pin sits beside the runner, with a leader to the exact
      // surface point, so the marker never covers the character's body.
      location.x = (frame.point.x * 0.5 + 0.5) * size.width + (active ? 42 : 0);
      location.y = (-frame.point.y * 0.5 + 0.5) * size.height - (active ? 8 : 0);
      const primary = location.kind === 'destination';
      const width = location.label.length * (primary ? 8.2 : 7.4) + 8;
      location.bounds.left = active ? location.x - 13 : location.x - width / 2;
      location.bounds.right = active ? location.x + width + 26 : location.x + width / 2;
      location.bounds.top = location.y - (active ? 28 : primary ? 49 : 40);
      location.bounds.bottom = location.y + 2;
      const horizonFade = MathUtils.smoothstep(location.depth, 0.015, 0.2);
      const horizontalFade = MathUtils.smoothstep(Math.min(location.bounds.left, size.width - location.bounds.right), -4, 30);
      const verticalFade = MathUtils.smoothstep(location.y, 20, 50) * (1 - MathUtils.smoothstep(location.y, size.height - 106, size.height - 35));
      location.targetOpacity = horizonFade * horizontalFade * verticalFade * (primary ? 1 : 0.92);
      location.score = (active ? 1000 : primary ? 100 : 0) + location.depth * 10 + (location.opacity > 0.2 ? 3 : 0);
    }

    // Keep a few readable annotations in view rather than a wall of labels.
    // The physical pins remain on the terrain when a caption has no room.
    frame.candidates.sort((a, b) => b.score - a.score);
    frame.occupied.length = 0;
    for (const location of frame.candidates) {
      if (location.targetOpacity < 0.05) continue;
      const active = location.id === selected || location.id === motion.current.nearbyLocation && motion.current.dwellAtFeet;
      const crowded = !active && (intersects(location.bounds, frame.actorBounds) || frame.occupied.some(bounds => intersects(location.bounds, bounds)));
      if (crowded || frame.occupied.length >= (size.width < 540 ? 6 : 8)) location.targetOpacity = 0;
      else frame.occupied.push(location.bounds);
    }
    for (const location of locations) {
      const label = labels.current[location.index];
      if (!label) continue;
      location.opacity = reduced ? location.targetOpacity : MathUtils.damp(location.opacity, location.targetOpacity, 12, Math.min(delta, 0.05));
      const focused = document.activeElement === label;
      const visible = location.opacity > 0.12 || focused;
      const visibility = visible ? 'visible' : 'hidden';
      if (label.style.visibility !== visibility) label.style.visibility = visibility;
      const tabIndex = location.opacity > 0.45 || focused ? 0 : -1;
      if (label.tabIndex !== tabIndex) label.tabIndex = tabIndex;
      if (visible) {
        const scale = location.id === selected ? 1.05 : 0.94 + Math.max(0, location.depth) * 0.06;
        const transform = `translate3d(${Math.round(location.x * 10) / 10}px, ${Math.round(location.y * 10) / 10}px, 0px) translate(-50%, -100%) scale(${Math.round(scale * 1000) / 1000})`;
        if (label.style.transform !== transform) label.style.transform = transform;
        const opacity = String(Math.round(location.opacity * 1000) / 1000);
        if (label.style.opacity !== opacity) label.style.opacity = opacity;
      }
      const nearby = motion.current.nearbyLocation === location.id && motion.current.dwellProgress > 0.03;
      const atFeet = String(nearby && motion.current.dwellAtFeet);
      const dwell = nearby ? String(motion.current.dwellProgress) : '0';
      if (label.dataset.nearby !== String(nearby)) label.dataset.nearby = String(nearby);
      if (label.dataset.atFeet !== atFeet) label.dataset.atFeet = atFeet;
      if (label.style.getPropertyValue('--dwell') !== dwell) label.style.setProperty('--dwell', dwell);
    }
  }, -0.5);

  return <group>
    {locations.map(location => {
      const primary = location.kind === 'destination';
      const active = location.id === selected;
      return <group key={location.id} position={location.position} quaternion={location.rotation}>
        <mesh>
          <ringGeometry args={active ? [0.075, 0.09, 24] : primary ? [0.045, 0.056, 20] : [0.032, 0.041, 16]} />
          <meshBasicMaterial color={location.color} transparent opacity={active ? 1 : primary ? 0.8 : 0.64} side={DoubleSide} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh visible={!active} position={[0, 0, location.height / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.004, 0.004, location.height, 5]} />
          <meshBasicMaterial color={location.color} transparent opacity={primary ? 0.8 : 0.64} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh visible={!active} position={[0, 0, location.height]}>
          <sphereGeometry args={[primary ? 0.016 : 0.012, 8, 6]} />
          <meshBasicMaterial color={location.color} transparent opacity={primary ? 0.95 : 0.8} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>;
    })}
  </group>;
}
