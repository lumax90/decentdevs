'use client';

import { useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, MathUtils } from 'three';
import { GAIT_DISTANCE, PLANET_SCALE, type OrbitMotion } from './motion';
import type { CourierRig } from './courier-rig';

export function Courier({ rig, motion, playing, reduced }: { rig: CourierRig; motion: RefObject<OrbitMotion>; playing: boolean; reduced: boolean }) {
  const facing = useRef<Group>(null), lean = useRef<Group>(null);
  const greetingTurn = useRef(false), turnVelocity = useRef(0);

  useFrame((_, delta) => {
    if (!facing.current || !lean.current || delta <= 0) return;
    const dt = Math.min(delta, 0.05), m = motion.current;
    if (reduced) {
      rig.greeting.restore();
      rig.bag.restore();
      rig.run.setEffectiveWeight(0);
      rig.idle.setEffectiveWeight(1);
      rig.mixer.update(0);
      facing.current.rotation.y = m.cameraHeading;
      lean.current.rotation.x = 0;
      return;
    }
    const paused = !playing || m.arrived;
    if (!paused) greetingTurn.current = false;
    else if (m.activity < 0.06) greetingTurn.current = true;
    const desired = paused ? greetingTurn.current ? m.cameraHeading : facing.current.rotation.y : m.heading + Math.PI / 2;
    const turn = Math.atan2(Math.sin(desired - facing.current.rotation.y), Math.cos(desired - facing.current.rotation.y));
    if (paused) {
      const acceleration = MathUtils.clamp(18 * turn - 8.5 * turnVelocity.current, -5.5, 5.5);
      turnVelocity.current = MathUtils.clamp(turnVelocity.current + acceleration * dt, -2.2, 2.2);
      if (Math.abs(turn) < 0.003 && Math.abs(turnVelocity.current) < 0.025) turnVelocity.current = 0;
      facing.current.rotation.y += turnVelocity.current * dt;
    } else {
      const rotation = turn * (1 - Math.exp(-12 * dt));
      facing.current.rotation.y += rotation;
      turnVelocity.current = rotation / dt;
    }
    const turning = paused && greetingTurn.current ? MathUtils.smoothstep(Math.abs(turnVelocity.current), 0.08, 1.2) : 0;
    rig.greeting.step(dt, paused && greetingTurn.current && Math.abs(turn) < 0.055 && Math.abs(turnVelocity.current) < 0.13);
    lean.current.rotation.x = MathUtils.damp(lean.current.rotation.x, Math.min(Math.abs(m.characterVelocity) * 0.065, 0.09), 9, dt);
    const activity = Math.max(m.activity, turning * 0.3) * (1 - rig.greeting.weight);
    rig.run.setEffectiveWeight(activity);
    rig.idle.setEffectiveWeight(1 - activity);
    const playback = Math.max(Math.abs(m.characterVelocity) * PLANET_SCALE / GAIT_DISTANCE * rig.duration, turning * 0.72);
    rig.run.setEffectiveTimeScale(MathUtils.damp(rig.run.timeScale, playback, 10, dt));
    rig.greeting.restore();
    rig.bag.restore();
    rig.mixer.update(dt);
    rig.scene.updateWorldMatrix(true, true);
    rig.greeting.apply();
    rig.bag.update(dt, activity, turnVelocity.current, lean.current.rotation.x);
  }, -0.25);

  return <group ref={facing} rotation={[0, Math.PI / 2, 0]}>
    <group ref={lean}>
      <group scale={0.76 / 1.7}><primitive object={rig.scene} dispose={null} /></group>
    </group>
  </group>;
}
