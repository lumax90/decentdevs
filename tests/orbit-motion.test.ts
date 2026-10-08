import test from 'node:test';
import assert from 'node:assert/strict';
import { Euler, Quaternion, Vector3 } from 'three';
import { heroMapLocations } from '../src/lib/hero-destinations';
import { createGlobeMotion, createMotion, createSurfaceMotion, destinationNormals, landingNormal, stepGlobe, stepSurface, surfaceRadius } from '../src/components/ui/orbit/motion';

test('every destination actually arrives beneath the runner after a change of route', () => {
  const globe = createGlobeMotion(), motion = createMotion(), surface = createSurfaceMotion();
  for (const destination of heroMapLocations) {
    motion.destination = destination.id;
    motion.revision++;
    for (let frame = 0; frame < 1200; frame++) {
      const snap = stepGlobe(globe, motion, 1 / 120, true, false, landingNormal);
      stepSurface(surface, motion, globe.orientation, landingNormal, 1 / 120, false, snap);
    }
    const marker = destinationNormals[destination.id].clone().applyQuaternion(globe.orientation);
    assert.ok(marker.distanceTo(landingNormal) < 0.004, `${destination.id}: marker should reach the landing point`);
    assert.ok(surface.current.distanceTo(destinationNormals[destination.id]) < 0.008, `${destination.id}: feet should reach the marker`);
    assert.ok(Math.abs(surface.worldNormal.length() - 1) < 1e-7);
    assert.ok(Math.abs(globe.orientation.length() - 1) < 1e-7);
    assert.ok(motion.activity < 0.06, 'running should stop on arrival');
  }
});

test('pause cancels drag inertia and reduced-motion selection snaps to the correct surface point', () => {
  const globe = createGlobeMotion(), motion = createMotion(), surface = createSurfaceMotion();
  const before = globe.orientation.clone();
  Object.assign(motion, { dragging: true, planetVelocity: 1, pitchVelocity: 0.5, dragTarget: 5 });
  for (let frame = 0; frame < 120; frame++) stepGlobe(globe, motion, 1 / 120, false, false, landingNormal);
  assert.deepEqual(globe.orientation.toArray(), before.toArray());
  assert.equal(motion.planetVelocity, 0);
  assert.equal(motion.dragging, false);
  motion.destination = 'mobile';
  motion.revision++;
  const snap = stepGlobe(globe, motion, 1 / 120, false, true, landingNormal);
  stepSurface(surface, motion, globe.orientation, landingNormal, 1 / 120, true, snap);
  assert.equal(snap, true);
  assert.ok(surface.current.distanceTo(destinationNormals.mobile) < 1e-7);
  assert.equal(motion.activity, 0);
});

test('the surface lookup is continuous across longitude wrap and finite at the poles', () => {
  const map = { width: 4, height: 3, radii: [0.95, 0.95, 0.95, 0.95, 0.9, 1, 1.02, 0.97, 0.98, 0.98, 0.98, 0.98] };
  const left = surfaceRadius(map, new Vector3(-1e-8, 0, 1).normalize());
  const right = surfaceRadius(map, new Vector3(1e-8, 0, 1).normalize());
  assert.ok(Math.abs(left - right) < 1e-7);
  assert.equal(surfaceRadius(map, new Vector3(0, 1, 0)), 0.95);
  assert.equal(surfaceRadius(map, new Vector3(0, -1, 0)), 0.98);
});

test('rotating to any side still reveals locations in the visible upper hemisphere', () => {
  for (const pitch of [-Math.PI / 2, -Math.PI / 4, 0, Math.PI / 4, Math.PI / 2]) {
    for (let step = 0; step < 12; step++) {
      const rotation = new Quaternion().setFromEuler(new Euler(pitch, step * Math.PI / 6, 0));
      const visible = heroMapLocations.filter(location => {
        const point = new Vector3(...location.position).applyQuaternion(rotation);
        return point.z > 0.2 && point.y > -0.1 && Math.abs(point.x) < 0.87;
      });
      assert.ok(visible.length >= 3, `Sparse view at pitch ${pitch}, turn ${step}`);
      assert.ok(visible.some(location => location.kind === 'technology'));
    }
  }
});
