'use client';

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { BufferGeometry, Group, Line, LineDashedMaterial, MathUtils, OrthographicCamera, Quaternion, Vector3 } from 'three';
import { heroMapLocations, type HeroLocationId } from '@/lib/hero-destinations';
import { angularDistance, closestLocation, createLocationDwell, LOCATION_CAPTURE_ANGLE, LOCATION_DWELL_SECONDS, locationPoint, stepLocationDwell } from '@/lib/location-routing';
import { useWorldAssets, type WorldAssets } from './assets';
import { Courier } from './courier';
import { MapLocations } from './map-locations';
import { getWorldFraming } from './world-frame';
import { createGlobeMotion, createSurfaceMotion, destinationNormals, initialOrientation, landingNormal, PLANET_SCALE, stepGlobe, stepSurface, surfaceRadius, type OrbitMotion, type SurfaceMotion } from './motion';

export interface PlanetSceneProps {
  motion: RefObject<OrbitMotion>;
  labels: RefObject<(HTMLButtonElement | null)[]>;
  anchor: RefObject<HTMLDivElement | null>;
  active: boolean;
  playing: boolean;
  reduced: boolean;
  discovering: boolean;
  selected: HeroLocationId | null;
  revision: number;
  assetBaseUrl: string;
  onReady: () => void;
  onArrival: (location: HeroLocationId, visit: number) => void;
  onDiscover: (location: HeroLocationId, visit: number) => void;
  onFailure: () => void;
}

const up = new Vector3(0, 1, 0);

function ResponsiveCamera() {
  const { size, camera, invalidate } = useThree();
  useEffect(() => {
    (camera as OrthographicCamera).zoom = getWorldFraming(size.width, size.height).zoom;
    camera.updateProjectionMatrix();
    invalidate();
  }, [size, camera, invalidate]);
  return null;
}

function RenderQuality({ active, lowPower }: { active: boolean; lowPower: boolean }) {
  const { setDpr, gl } = useThree();
  const maximum = Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.75);
  const minimum = Math.min(maximum, 1);
  const sample = useRef({ warmup: 3, time: 0, frames: 0, goodWindows: 0 });
  useEffect(() => { sample.current = { warmup: 3, time: 0, frames: 0, goodWindows: 0 }; }, [active]);
  useFrame((state, delta) => {
    const s = sample.current;
    if (!active || delta <= 0) return;
    if (s.warmup > 0) { s.warmup -= Math.min(delta, 0.1); return; }
    if (delta > 0.12) { s.time = 0; s.frames = 0; return; }
    s.time += delta;
    s.frames++;
    if (s.time < 2) return;
    const average = s.time / s.frames, dpr = state.viewport.dpr;
    let next = dpr;
    if (average > 1 / 48) { next = Math.max(minimum, dpr - 0.25); s.goodWindows = 0; }
    else if (average < 1 / 57) { if (++s.goodWindows >= 4) { next = Math.min(maximum, dpr + 0.25); s.goodWindows = 0; } }
    else s.goodWindows = 0;
    s.time = 0; s.frames = 0;
    if (next !== dpr) { setDpr(next); s.warmup = 1; }
  });
  useEffect(() => { gl.setClearColor('#000000', 0); }, [gl]);
  return null;
}

function RouteTrail({ asset, surface, selected, revision }: { asset: WorldAssets; surface: RefObject<SurfaceMotion>; selected: HeroLocationId | null; revision: number }) {
  const line = useMemo(() => {
    if (!selected) return null;
    const start = surface.current.current.clone();
    const finish = destinationNormals[selected];
    const arc = new Quaternion().setFromUnitVectors(start, finish);
    const turn = new Quaternion();
    const points = Array.from({ length: 73 }, (_, i) => {
      const normal = start.clone().applyQuaternion(turn.identity().slerp(arc, i / 72));
      return normal.multiplyScalar(surfaceRadius(asset.surface, normal) * PLANET_SCALE + 0.025);
    });
    const geometry = new BufferGeometry().setFromPoints(points);
    const material = new LineDashedMaterial({ color: heroMapLocations.find(item => item.id === selected)!.color, dashSize: 0.045, gapSize: 0.035, transparent: true, opacity: 0.75, toneMapped: false });
    const trail = new Line(geometry, material);
    trail.computeLineDistances();
    return trail;
  }, [asset, surface, selected, revision]);
  useEffect(() => () => { line?.geometry.dispose(); line?.material.dispose(); }, [line]);
  return line ? <primitive object={line} dispose={null} /> : null;
}

function World(props: PlanetSceneProps) {
  const asset = useWorldAssets(props.assetBaseUrl);
  const root = useRef<Group>(null), planet = useRef<Group>(null), runner = useRef<Group>(null);
  const globe = useMemo(createGlobeMotion, []);
  const surface = useRef(createSurfaceMotion());
  const radius = useRef(2.2), arrival = useRef<number | null>(null);
  const dwell = useRef(createLocationDwell());
  const frame = useMemo(() => ({ screenUp: new Vector3(), neutral: new Vector3(), velocity: new Vector3(), cameraFront: new Vector3(), anchor: new Vector3(), inverseRunner: new Quaternion() }), []);
  const { invalidate, gl, size } = useThree();
  const { centerY } = getWorldFraming(size.width, size.height);

  useEffect(() => {
    if (asset) { props.onReady(); invalidate(); }
  }, [asset, props.onReady, invalidate]);
  useEffect(() => { invalidate(); }, [props.active, props.playing, props.reduced, props.revision, invalidate]);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault(); props.onFailure(); };
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl, props.onFailure]);

  useFrame(({ camera }, delta) => {
    if (!asset || !root.current || !planet.current || !runner.current) return;
    const m = props.motion.current;
    const elapsed = Math.min(Math.max(delta, 1 / 120), 0.05);
    const count = Math.ceil(elapsed / (1 / 120));
    frame.screenUp.copy(landingNormal).applyQuaternion(camera.quaternion);
    let snapped = false;
    for (let i = 0; i < count; i++) {
      const dt = elapsed / count;
      const snap = stepGlobe(globe, m, dt, props.playing, props.reduced, frame.screenUp);
      snapped ||= snap;
      stepSurface(surface.current, m, globe.orientation, frame.screenUp, dt, !props.playing || props.reduced, snap);
    }
    planet.current.quaternion.copy(globe.orientation);
    const s = surface.current;
    frame.neutral.copy(s.current).applyQuaternion(initialOrientation);
    m.mapPoint[0] = frame.neutral.x; m.mapPoint[1] = frame.neutral.y; m.mapPoint[2] = frame.neutral.z;
    const wantedRadius = surfaceRadius(asset.surface, s.current) * PLANET_SCALE + 0.014;
    radius.current = snapped || props.reduced ? wantedRadius : MathUtils.damp(radius.current, wantedRadius, 25, elapsed);
    runner.current.position.copy(s.worldNormal).multiplyScalar(radius.current);
    runner.current.quaternion.setFromUnitVectors(up, s.worldNormal);
    frame.inverseRunner.copy(runner.current.quaternion).invert();
    frame.cameraFront.set(0, 0, 1).applyQuaternion(camera.quaternion).applyQuaternion(frame.inverseRunner);
    m.cameraHeading = Math.atan2(frame.cameraFront.x, frame.cameraFront.z);
    if (s.velocity.lengthSq() > 1e-5) {
      frame.velocity.copy(s.worldVelocity).applyQuaternion(frame.inverseRunner);
      m.heading = Math.atan2(-frame.velocity.z, frame.velocity.x);
    }
    m.arrived = !!m.destination && s.current.distanceTo(destinationNormals[m.destination]) < 0.008 && m.activity < 0.06;
    if (m.arrived && m.destination && arrival.current !== m.revision) { arrival.current = m.revision; props.onArrival(m.destination, m.revision); }
    if (!m.arrived) arrival.current = null;
    if (m.dismissedLocation && angularDistance(m.mapPoint, locationPoint(m.dismissedLocation)) > 0.30) m.dismissedLocation = null;
    const nearest = props.discovering ? closestLocation(m.mapPoint) : null;
    const candidate = props.discovering ? m.hoveredLocation ?? (nearest && nearest.angle <= LOCATION_CAPTURE_ANGLE ? nearest.location : null) : null;
    const keyboardOnPin = document.activeElement?.matches('button[data-location]:focus-visible');
    const stable = props.discovering && props.active && !m.dragging && !keyboardOnPin && Math.abs(m.characterVelocity) < 0.035 && Math.abs(m.planetVelocity) < 0.035 && Math.abs(m.pitchVelocity) < 0.035 && m.time - m.lastInteraction > 0.25;
    const detected = stepLocationDwell(dwell.current, candidate === m.dismissedLocation ? null : candidate, elapsed, stable);
    m.nearbyLocation = dwell.current.candidate;
    m.dwellProgress = Math.min(1, dwell.current.elapsed / LOCATION_DWELL_SECONDS);
    m.dwellAtFeet = !!nearest && nearest.angle <= LOCATION_CAPTURE_ANGLE && nearest.location === m.nearbyLocation;
    if (detected && dwell.current.candidate) props.onDiscover(dwell.current.candidate, m.revision);
    if (m.arrived && props.anchor.current) {
      frame.anchor.copy(runner.current.position);
      frame.anchor.y += centerY;
      frame.anchor.project(camera);
      props.anchor.current.style.setProperty('--runner-x', `${((frame.anchor.x * 0.5 + 0.5) * size.width).toFixed(1)}px`);
      props.anchor.current.style.setProperty('--runner-y', `${((-frame.anchor.y * 0.5 + 0.5) * size.height).toFixed(1)}px`);
    }
  }, -1);

  if (!asset) return null;
  return <group ref={root} position={[0, centerY, 0]}>
    <group ref={planet} quaternion={globe.orientation}>
      <group scale={PLANET_SCALE}><primitive object={asset.planet} dispose={null} /></group>
      <RouteTrail asset={asset} surface={surface} selected={props.selected} revision={props.revision} />
      <MapLocations surface={asset.surface} orientation={globe.orientation} centerY={centerY} labels={props.labels} runner={runner} selected={props.selected} reduced={props.reduced} motion={props.motion} />
    </group>
    <group ref={runner}><Courier rig={asset.courier} motion={props.motion} playing={props.playing} reduced={props.reduced} /></group>
  </group>;
}

export default function PlanetScene(props: PlanetSceneProps) {
  const [lowPower] = useState(() => matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency || 4) <= 4);
  return <Canvas
    orthographic camera={{ position: [0, 0, 9], zoom: 100, near: 0.1, far: 30 }}
    dpr={lowPower ? [1, 1.25] : [1, 1.75]}
    frameloop={!props.active ? 'never' : props.reduced ? 'demand' : 'always'}
    gl={{ antialias: true, alpha: true, powerPreference: lowPower ? 'low-power' : 'high-performance' }}
    fallback={<span>Projenin yönünü alttaki seçeneklerden belirleyebilirsin.</span>}
    aria-hidden="true"
  >
    <ResponsiveCamera />
    <RenderQuality active={props.active} lowPower={lowPower} />
    <ambientLight intensity={0.95} />
    <hemisphereLight args={['#f3f5e9', '#77738d', 1.3]} />
    <directionalLight position={[-3, 5, 5]} intensity={2.7} color="#fff8ef" />
    <directionalLight position={[3, 2, -2]} intensity={1.5} color="#d5d1ff" />
    <World {...props} />
  </Canvas>;
}
