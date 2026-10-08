import { AnimationClip, AnimationMixer, Bone, LoopRepeat, Matrix4, Mesh, MeshStandardMaterial, NumberKeyframeTrack, Object3D, Quaternion, QuaternionKeyframeTrack, SkinnedMesh, Vector3, VectorKeyframeTrack, type KeyframeTrack } from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { BagSuspension, CourierGreeting } from './courier-gestures';
import { makeSeamlessRun } from './run-cycle';

function optimizeRigidBag(scene: Object3D) {
  scene.updateWorldMatrix(true, true);
  const candidates: SkinnedMesh[] = [];
  scene.traverse(node => { if (node instanceof SkinnedMesh && node.name.startsWith('Delivery_Bag')) candidates.push(node); });
  for (const mesh of candidates) {
    if (Object.keys(mesh.geometry.morphAttributes).length) continue;
    const weights = mesh.geometry.getAttribute('skinWeight');
    const indices = mesh.geometry.getAttribute('skinIndex');
    if (!weights || !indices) continue;
    let joint = -1, rigid = true;
    for (let vertex = 0; vertex < weights.count && rigid; vertex++) {
      let total = 0;
      for (let channel = 0; channel < 4; channel++) {
        const weight = weights.getComponent(vertex, channel);
        if (weight < 1e-6) continue;
        const index = indices.getComponent(vertex, channel);
        if (joint < 0) joint = index;
        if (index !== joint) { rigid = false; break; }
        total += weight;
      }
      if (Math.abs(total - 1) > 1e-4) rigid = false;
    }
    if (!rigid || joint < 0) continue;
    const bone = mesh.skeleton.bones[joint];
    const bind = new Matrix4().multiplyMatrices(mesh.skeleton.boneInverses[joint], mesh.bindMatrix);
    const geometry = mesh.geometry.clone().applyMatrix4(bind);
    geometry.deleteAttribute('skinIndex');
    geometry.deleteAttribute('skinWeight');
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    const bag = new Mesh(geometry, mesh.material);
    bag.name = mesh.name;
    bag.matrixAutoUpdate = false;
    mesh.removeFromParent();
    bone.add(bag);
    let shared = false;
    scene.traverse(node => { if (node instanceof Mesh && node.geometry === mesh.geometry) shared = true; });
    if (!shared) mesh.geometry.dispose();
  }
}

function makeIdle(scene: Object3D) {
  const tracks: KeyframeTrack[] = [];
  const breath = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), 0.009);
  scene.traverse(node => {
    if (node instanceof Mesh && node.morphTargetInfluences?.length) {
      const zeros = new Array(node.morphTargetInfluences.length).fill(0);
      tracks.push(new NumberKeyframeTrack(`${node.name}.morphTargetInfluences`, [0, 3], [...zeros, ...zeros]));
    }
    if (!(node instanceof Bone)) return;
    const q = node.quaternion.clone(), middle = q.clone();
    if (node.name === 'Spine02' || node.name === 'neck') middle.multiply(breath);
    tracks.push(new QuaternionKeyframeTrack(`${node.name}.quaternion`, [0, 1.5, 3], [...q.toArray(), ...middle.toArray(), ...q.toArray()]));
    const p = node.position.clone(), inhale = p.clone();
    if (node.name === 'Hips') inhale.y += 0.004;
    tracks.push(new VectorKeyframeTrack(`${node.name}.position`, [0, 1.5, 3], [...p.toArray(), ...inhale.toArray(), ...p.toArray()]));
    tracks.push(new VectorKeyframeTrack(`${node.name}.scale`, [0, 3], [...node.scale.toArray(), ...node.scale.toArray()]));
  });
  return new AnimationClip('Courier_Idle', 3, tracks);
}

export function createCourierRig(gltf: GLTF) {
  optimizeRigidBag(gltf.scene);
  gltf.scene.traverse(node => {
    if (!(node instanceof Mesh)) return;
    node.morphTargetInfluences?.fill(0);
    if (node instanceof SkinnedMesh) node.frustumCulled = false;
    for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
      if (material instanceof MeshStandardMaterial) {
        material.metalness = 0;
        material.roughness = 0.9;
        material.normalScale.setScalar(0.25);
        if (material.map) material.map.anisotropy = 4;
      }
    }
  });
  const clips = gltf.animations.filter(animation => animation.duration > 0.3);
  if (!clips.length) throw new Error('The courier run animation is missing.');
  const source = new AnimationClip('Courier_Run_Source', -1, clips.flatMap(animation => animation.tracks));
  const mixer = new AnimationMixer(gltf.scene);
  const bag = new BagSuspension(gltf.scene);
  const greeting = new CourierGreeting(gltf.scene);
  const idle = mixer.clipAction(makeIdle(gltf.scene)).play();
  const seamless = makeSeamlessRun(source);
  const run = mixer.clipAction(seamless).setLoop(LoopRepeat, Infinity).play();
  run.zeroSlopeAtStart = false;
  run.zeroSlopeAtEnd = false;
  run.setEffectiveTimeScale(0);
  run.setEffectiveWeight(0);
  mixer.update(0);
  return { scene: gltf.scene, mixer, idle, run, duration: seamless.duration, bag, greeting };
}

export type CourierRig = ReturnType<typeof createCourierRig>;
