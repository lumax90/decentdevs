import { Bone, Euler, MathUtils, Matrix4, Object3D, Quaternion, Vector3 } from 'three';

// Secondary motion from the supplied Orbit Delivery character: keep the bag
// hanging naturally while the body leans, and greet once the runner stops.
export class BagSuspension {
  bone: Bone;
  restOrientation = new Quaternion();
  animatedOrientation = new Quaternion();
  animatedPosition = new Vector3();
  localAnchor = new Vector3();
  gravityTilt = new Quaternion();
  pelvisYaw = new Quaternion();
  inverseRest = new Quaternion();
  xAxis = new Vector3(1, 0, 0);
  hangingOrientation = new Quaternion();
  sceneOrientation = new Quaternion();
  parentOrientation = new Quaternion();
  swing = new Quaternion();
  angles = new Euler();
  inverseScene = new Matrix4();
  anchor = new Vector3();
  previousAnchor = new Vector3();
  velocity = new Vector3();
  previousVelocity = new Vector3();
  acceleration = new Vector3();
  initialized = false;
  applied = false;
  pitch = 0;
  roll = 0.008;
  pitchVelocity = 0;
  rollVelocity = 0;

  constructor(private scene: Object3D) {
    const bone = scene.getObjectByName('CourierBag');
    if (!(bone instanceof Bone)) throw new Error('Courier bag attachment is missing.');
    this.bone = bone;
    scene.updateWorldMatrix(true, true);
    scene.getWorldQuaternion(this.sceneOrientation);
    bone.getWorldQuaternion(this.restOrientation);
    this.restOrientation.premultiply(this.sceneOrientation.invert());
    this.inverseRest.copy(this.restOrientation).invert();
  }

  restore() {
    if (!this.applied) return;
    this.bone.position.copy(this.animatedPosition);
    this.bone.quaternion.copy(this.animatedOrientation);
    this.applied = false;
  }

  update(dt: number, activity: number, turnRate: number, bodyLean: number) {
    if (dt <= 0 || !this.bone.parent) return;
    this.animatedPosition.copy(this.bone.position);
    this.animatedOrientation.copy(this.bone.quaternion);
    this.inverseScene.copy(this.scene.matrixWorld).invert();
    this.bone.getWorldPosition(this.anchor).applyMatrix4(this.inverseScene);
    if (!this.initialized) { this.previousAnchor.copy(this.anchor); this.initialized = true; }
    this.velocity.copy(this.anchor).sub(this.previousAnchor).divideScalar(dt);
    this.acceleration.copy(this.velocity).sub(this.previousVelocity).divideScalar(dt);
    this.previousVelocity.lerp(this.velocity, 1 - Math.exp(-14 * dt));
    this.previousAnchor.copy(this.anchor);
    const gravity = Math.max(4, 9.81 + this.acceleration.y);
    const targetPitch = MathUtils.clamp(Math.atan2(this.acceleration.z, gravity), -0.1, 0.1);
    const targetRoll = MathUtils.clamp(Math.atan2(-this.acceleration.x, gravity) + Math.abs(turnRate) * 0.001, -0.012, 0.045);
    const steps = Math.ceil(dt / (1 / 120)), h = dt / steps;
    for (let i = 0; i < steps; i++) {
      this.pitchVelocity += ((targetPitch - this.pitch) * 72 - this.pitchVelocity * 11) * h;
      this.rollVelocity += ((targetRoll - this.roll) * 64 - this.rollVelocity * 10) * h;
      this.pitch = MathUtils.clamp(this.pitch + this.pitchVelocity * h, -0.12, 0.12);
      this.roll = MathUtils.clamp(this.roll + this.rollVelocity * h, -0.012, 0.05);
    }
    this.scene.getWorldQuaternion(this.sceneOrientation);
    this.bone.getWorldQuaternion(this.pelvisYaw).premultiply(this.parentOrientation.copy(this.sceneOrientation).invert()).multiply(this.inverseRest);
    this.pelvisYaw.set(0, this.pelvisYaw.y, 0, this.pelvisYaw.w).normalize();
    this.bone.parent.getWorldQuaternion(this.parentOrientation).invert();
    this.swing.setFromEuler(this.angles.set(this.pitch, 0, this.roll));
    this.gravityTilt.setFromAxisAngle(this.xAxis, -bodyLean);
    this.hangingOrientation.copy(this.parentOrientation).multiply(this.sceneOrientation).multiply(this.gravityTilt).multiply(this.pelvisYaw).multiply(this.swing).multiply(this.restOrientation);
    this.bone.quaternion.copy(this.animatedOrientation).slerp(this.hangingOrientation, 1 - activity * 0.3);
    this.localAnchor.copy(this.anchor).addScaledVector(this.xAxis, -0.009 * (1 - activity * 0.5));
    this.localAnchor.y -= 0.027;
    this.localAnchor.applyMatrix4(this.scene.matrixWorld);
    this.bone.parent.worldToLocal(this.localAnchor);
    this.bone.position.copy(this.localAnchor);
    this.bone.updateWorldMatrix(false, true);
    this.applied = true;
  }
}

const up = new Vector3(0, 1, 0);
type GreetingJoint = { bone: Bone; rest: Quaternion; direction: Vector3; animated: Quaternion };

export class CourierGreeting {
  joints: GreetingJoint[];
  sceneRotation = new Quaternion();
  inverseParent = new Quaternion();
  aim = new Quaternion();
  twist = new Quaternion();
  target = new Quaternion();
  direction = new Vector3();
  palm = new Vector3();
  wantedPalm = new Vector3();
  cross = new Vector3();
  restBendNormal = new Vector3();
  bendNormal = new Vector3();
  upperDirection = new Vector3(-0.55, -0.65, 0.52).normalize();
  forearmDirection = new Vector3();
  phase = 0;
  applied = false;
  weight = 0;

  constructor(private scene: Object3D) {
    scene.updateWorldMatrix(true, true);
    const inverseScene = scene.getWorldQuaternion(new Quaternion()).invert();
    this.joints = ['RightArm', 'RightForeArm', 'RightHand'].map(name => {
      const bone = scene.getObjectByName(name);
      if (!(bone instanceof Bone)) throw new Error(`Greeting joint ${name} is missing.`);
      const rest = bone.getWorldQuaternion(new Quaternion()).premultiply(inverseScene);
      const direction = up.clone().applyQuaternion(rest).normalize();
      return { bone, rest, direction, animated: bone.quaternion.clone() };
    });
    this.restBendNormal.crossVectors(this.joints[0].direction, this.joints[1].direction).normalize();
  }

  restore() {
    if (!this.applied) return;
    for (const joint of this.joints) joint.bone.quaternion.copy(joint.animated);
    this.applied = false;
  }

  step(dt: number, ready: boolean) {
    this.weight = MathUtils.damp(this.weight, ready ? 1 : 0, ready ? 4 : 9, dt);
    if (this.weight < 1e-4) { this.weight = 0; this.phase = 0; }
    if (ready && this.weight > 0.85) this.phase = Math.min(Math.PI * 4, this.phase + dt * Math.PI * 2 * 0.9);
  }

  apply() {
    if (this.weight === 0) return;
    this.scene.getWorldQuaternion(this.sceneRotation);
    const wave = Math.sin(this.phase) * 0.12 * MathUtils.smoothstep(this.weight, 0.85, 0.99);
    this.forearmDirection.set(-0.08 + wave * 0.35, 0.94, 0.33).normalize();
    this.bendNormal.crossVectors(this.upperDirection, this.forearmDirection).normalize();
    this.joints.forEach((joint, index) => {
      if (!joint.bone.parent) return;
      joint.animated.copy(joint.bone.quaternion);
      if (index === 0) this.direction.copy(this.upperDirection);
      else if (index === 1) this.direction.copy(this.forearmDirection);
      else this.direction.set(-0.06 + wave, 0.97, 0.22);
      this.direction.normalize();
      this.aim.setFromUnitVectors(joint.direction, this.direction);
      this.target.copy(this.aim).multiply(joint.rest);
      this.palm.copy(this.restBendNormal).addScaledVector(joint.direction, -this.restBendNormal.dot(joint.direction)).normalize().applyQuaternion(this.aim);
      this.wantedPalm.copy(this.bendNormal).addScaledVector(this.direction, -this.bendNormal.dot(this.direction)).normalize();
      const angle = Math.atan2(this.direction.dot(this.cross.crossVectors(this.palm, this.wantedPalm)), this.palm.dot(this.wantedPalm));
      this.twist.setFromAxisAngle(this.direction, angle);
      this.target.premultiply(this.twist);
      joint.bone.parent.getWorldQuaternion(this.inverseParent).invert();
      this.target.premultiply(this.sceneRotation).premultiply(this.inverseParent);
      joint.bone.quaternion.slerp(this.target, this.weight);
      joint.bone.updateWorldMatrix(false, true);
    });
    this.applied = true;
  }
}
