import test from 'node:test';
import assert from 'node:assert/strict';
import { closestLocation, createLocationDwell, LOCATION_DWELL_SECONDS, locationPoint, planNearbyStop, stepLocationDwell } from '../src/lib/location-routing';

test('a short stable dwell fires once, while dragging and moving to another pin cancel it', () => {
  const dwell = createLocationDwell();
  for (let i = 0; i < 24; i++) assert.equal(stepLocationDwell(dwell, 'rust', .04, true), false);
  stepLocationDwell(dwell, 'rust', .04, false);
  assert.equal(dwell.elapsed, 0);
  for (let i = 0; i < 25; i++) stepLocationDwell(dwell, 'rust', .04, true);
  assert.equal(stepLocationDwell(dwell, 'react', .04, true), false);
  assert.ok(dwell.elapsed < .1);
  let opened = 0;
  for (let i = 0; i < 100; i++) if (stepLocationDwell(dwell, 'react', .04, true)) opened++;
  assert.equal(opened, 1);
  assert.ok(dwell.elapsed >= LOCATION_DWELL_SECONDS);
});

test('nearest navigation starts at the actual free-exploration position', () => {
  assert.equal(closestLocation(locationPoint('docker'))?.location, 'docker');
  assert.equal(planNearbyStop(locationPoint('kotlin'), ['game', 'react']).location, 'kotlin');
  assert.equal(planNearbyStop('webgl', ['webgl']).location, 'docker');
  assert.equal(planNearbyStop('rust', ['rust']).location, 'website');
});
