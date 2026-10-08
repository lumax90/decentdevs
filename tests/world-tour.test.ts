import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { advanceWorldTour, createWorldTour, tourStopFor, worldTourStops, type WorldTourState } from '../src/lib/world-tour';
import { heroMapLocations, type HeroLocationId } from '../src/lib/hero-destinations';
import { angularDistance, locationPoint } from '../src/lib/location-routing';

function completeStop(state: WorldTourState) {
  assert.ok(state.target);
  const visit = state.visit;
  state = advanceWorldTour(state, { type: 'arrive', target: state.target!, visit });
  assert.equal(state.phase, 'settling');
  state = advanceWorldTour(state, { type: 'reveal', visit });
  assert.equal(state.phase, 'preview');
  state = advanceWorldTour(state, { type: 'ended', visit });
  assert.equal(state.phase, 'departing');
  return advanceWorldTour(state, { type: 'leave', visit });
}

test('every location has a published video and poster', () => {
  for (const stop of worldTourStops) {
    const video = resolve('public/hero/tour', `${stop.scene}.mp4`);
    const poster = resolve('public/hero/tour', `${stop.scene}.webp`);
    assert.ok(statSync(video).size > 1000, stop.location);
    assert.equal(readFileSync(video).toString('ascii', 4, 8), 'ftyp', stop.location);
    assert.ok(statSync(poster).size > 100, stop.location);
  }
});

test('all 23 locations have distinct animations and the tour picks the closest unvisited stop', () => {
  assert.equal(worldTourStops.length, heroMapLocations.length);
  assert.equal(new Set(worldTourStops.map(stop => stop.scene)).size, heroMapLocations.length);
  for (const location of heroMapLocations) assert.ok(tourStopFor(location.id), location.id);
  let state = advanceWorldTour(createWorldTour(), { type: 'start' });
  assert.equal(state.target, 'game');
  assert.equal(advanceWorldTour(state, { type: 'ended', visit: state.visit }), state);
  const visited = new Set<HeroLocationId>();
  for (let i = 0; i < worldTourStops.length; i++) {
    const from: HeroLocationId = state.target!;
    assert.equal(visited.has(from), false);
    visited.add(from);
    state = completeStop(state);
    const candidates = heroMapLocations.filter(location => !visited.has(location.id));
    if (candidates.length) {
      const nearest = Math.min(...candidates.map(location => angularDistance(locationPoint(from), location.position)));
      assert.ok(angularDistance(locationPoint(from), locationPoint(state.target!)) <= nearest + 1e-8);
    } else assert.notEqual(state.target, from);
  }
  assert.equal(visited.size, heroMapLocations.length);
  assert.equal(state.mode, 'auto');
});

test('manual control cancels late arrival, media and idle callbacks from the previous visit', () => {
  const route = advanceWorldTour(createWorldTour(), { type: 'start' });
  const manual = advanceWorldTour(route, { type: 'manual' });
  assert.equal(manual.mode, 'manual');
  assert.equal(manual.target, null);
  for (const action of [
    { type: 'arrive' as const, target: 'game' as const, visit: route.visit },
    { type: 'reveal' as const, visit: route.visit },
    { type: 'ended' as const, visit: route.visit },
    { type: 'leave' as const, visit: route.visit },
    { type: 'start' as const, visit: route.visit },
  ]) assert.equal(advanceWorldTour(manual, action), manual);
});

test('a manually discovered location continues nearby instead of returning to the initial route', () => {
  const free = advanceWorldTour(createWorldTour(), { type: 'manual', origin: locationPoint('kotlin') });
  const resumed = advanceWorldTour(free, { type: 'start', origin: locationPoint('kotlin') });
  assert.equal(resumed.target, 'kotlin');
  const discovered = advanceWorldTour(free, { type: 'discover', target: 'kotlin', visit: free.visit });
  const finished = completeStop(discovered);
  assert.equal(finished.mode, 'auto');
  assert.equal(finished.target, 'unity');
  assert.notEqual(finished.target, 'game');
});

test('a manually chosen web application has its own animation and continues from there', () => {
  const route = advanceWorldTour(createWorldTour(), { type: 'manual', target: 'webapp' });
  assert.equal(tourStopFor(route.target)?.scene, 'webapp');
  const finished = completeStop(route);
  assert.equal(finished.mode, 'auto');
  assert.equal(finished.phase, 'travelling');
  assert.notEqual(finished.target, 'webapp');
  assert.ok(finished.visited.includes('webapp'));
});

test('selecting a new route rejects an arrival for a different destination, even with a matching visit', () => {
  const state = advanceWorldTour(createWorldTour(), { type: 'manual', target: 'mobile' });
  assert.equal(advanceWorldTour(state, { type: 'arrive', target: 'game', visit: state.visit }), state);
  const again = advanceWorldTour(state, { type: 'manual', target: 'mobile' });
  assert.notEqual(again.visit, state.visit);
  assert.equal(advanceWorldTour(again, { type: 'arrive', target: 'mobile', visit: state.visit }), again);
});
