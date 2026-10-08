'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type { HeroLocationId } from '@/lib/hero-destinations';
import { advanceWorldTour, createWorldTour, TOUR_IDLE_MS, tourStopFor, type TourAction } from '@/lib/world-tour';
import { planNearbyStop, type MapPoint } from '@/lib/location-routing';
import { stopMomentum, type OrbitMotion } from './state';

/** Timers retain their remaining active time while hidden or paused. */
function useActiveDelay(key: string, delay: number, enabled: boolean, callback: () => void) {
  const clock = useRef({ key, remaining: delay });
  if (clock.current.key !== key) clock.current = { key, remaining: delay };
  const latest = useRef(callback);
  latest.current = callback;
  useEffect(() => {
    if (clock.current.key !== key) clock.current = { key, remaining: delay };
    if (!enabled) return;
    const started = performance.now();
    const timer = window.setTimeout(() => { if (clock.current.key === key) { clock.current.remaining = 0; latest.current(); } }, clock.current.remaining);
    return () => {
      window.clearTimeout(timer);
      if (clock.current.key === key) clock.current.remaining = Math.max(0, clock.current.remaining - (performance.now() - started));
    };
  }, [key, delay, enabled]);
}

interface TourOptions { ready: boolean; active: boolean; playing: boolean; reduced: boolean; dragging: boolean; held: boolean }

export function useWorldTour(motion: RefObject<OrbitMotion>, options: TourOptions) {
  const [state, setState] = useState(createWorldTour);
  const current = useRef(state);
  const dispatch = useCallback((action: TourAction) => {
    const previous = current.current;
    const next = advanceWorldTour(previous, action);
    if (next === previous) return;
    current.current = next;
    if (next.visit !== previous.visit) {
      if (!next.target && previous.arrived && previous.target) motion.current.dismissedLocation = previous.target;
      if (next.target) motion.current.dismissedLocation = null;
      stopMomentum(motion.current);
      motion.current.destination = next.target;
      motion.current.revision = next.visit;
      motion.current.arrived = false;
      motion.current.lastInteraction = motion.current.time;
      motion.current.hoveredLocation = null;
      motion.current.nearbyLocation = null;
      motion.current.dwellProgress = 0;
      motion.current.dwellAtFeet = false;
    }
    setState(next);
  }, [motion]);
  const position = useCallback((): MapPoint => [...motion.current.mapPoint], [motion]);
  const manual = useCallback((target: HeroLocationId | null = null) => dispatch({ type: 'manual', target, origin: position() }), [dispatch, position]);
  const start = useCallback(() => dispatch({ type: 'start', origin: position() }), [dispatch, position]);
  const skip = useCallback(() => dispatch({ type: 'skip', origin: position() }), [dispatch, position]);
  const discover = useCallback((target: HeroLocationId, visit: number) => dispatch({ type: 'discover', target, visit }), [dispatch]);
  const arrive = useCallback((target: HeroLocationId, visit: number) => dispatch({ type: 'arrive', target, visit }), [dispatch]);
  const ended = useCallback((visit: number) => dispatch({ type: 'ended', visit }), [dispatch]);
  const active = options.ready && options.active;
  const moving = active && options.playing && !options.reduced;

  useActiveDelay(`start:${state.visit}`, 700, moving && state.mode === 'auto' && state.phase === 'waiting', () => dispatch({ type: 'start', visit: state.visit }));
  useActiveDelay(`arrive:${state.visit}`, options.reduced ? 0 : 650, active && (options.playing || options.reduced) && state.phase === 'settling', () => dispatch({ type: 'reveal', visit: state.visit }));
  useActiveDelay(`leave:${state.visit}`, 850, moving && !options.held && state.phase === 'departing', () => dispatch({ type: 'leave', visit: state.visit }));
  useActiveDelay(`idle:${state.visit}`, TOUR_IDLE_MS, moving && !options.dragging && !options.held && state.mode === 'manual' && state.phase === 'waiting', () => {
    dispatch({ type: 'start', origin: position(), visit: state.visit });
  });
  // A failed or stalled media request must not strand the courier forever.
  useActiveDelay(`media:${state.visit}`, 16000, moving && !options.held && state.phase === 'preview', () => ended(state.visit));

  const preview = state.phase === 'preview' || state.phase === 'departing' ? tourStopFor(state.target) : null;
  const next = tourStopFor(planNearbyStop(state.target ?? position(), state.visited).location)!;
  return { state, preview, next, manual, start, skip, arrive, ended, discover };
}
