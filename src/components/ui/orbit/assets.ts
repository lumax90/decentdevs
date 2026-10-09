import { useEffect, useState } from 'react';
import { FrontSide, Mesh, MeshStandardMaterial, SkinnedMesh, Texture, type BufferGeometry, type Material, type Object3D, type Skeleton, type WebGLRenderer } from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { createCourierRig, type CourierRig } from './courier-rig';
import type { SurfaceMap } from './motion';

export function disposeScene(scene: Object3D) {
  const textures = new Set<Texture>(), materials = new Set<Material>();
  const geometries = new Set<BufferGeometry>(), skeletons = new Set<Skeleton>();
  scene.traverse(node => {
    if (!(node instanceof Mesh)) return;
    geometries.add(node.geometry);
    if (node instanceof SkinnedMesh) skeletons.add(node.skeleton);
    for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
      materials.add(material);
      for (const value of Object.values(material)) if (value instanceof Texture) textures.add(value);
    }
  });
  geometries.forEach(geometry => geometry.dispose());
  skeletons.forEach(skeleton => skeleton.dispose());
  materials.forEach(material => material.dispose());
  textures.forEach(texture => {
    texture.dispose();
    if (typeof ImageBitmap !== 'undefined' && texture.image instanceof ImageBitmap) texture.image.close();
  });
}

export interface WorldAssets { planet: GLTF['scene']; courier: CourierRig; surface: SurfaceMap }

async function prepareTextures(asset: WorldAssets, renderer: WebGLRenderer, signal: AbortSignal) {
  const textures = new Set<Texture>();
  const collect = (node: Object3D) => {
    if (!(node instanceof Mesh)) return;
    for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
      for (const value of Object.values(material)) if (value instanceof Texture) textures.add(value);
    }
  };
  asset.planet.traverse(collect);
  asset.courier.scene.traverse(collect);
  // Spread GPU uploads across tasks so buttons and scrolling remain responsive.
  for (const texture of textures) {
    await new Promise<void>(resolve => setTimeout(resolve, 0));
    signal.throwIfAborted();
    renderer.initTexture(texture);
  }
}

export function useWorldAssets(base: string, renderer: WebGLRenderer) {
  const [asset, setAsset] = useState<WorldAssets | null>(null);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    const abort = new AbortController();
    const signal = AbortSignal.any([abort.signal, AbortSignal.timeout(25000)]);
    const draco = new DRACOLoader().setDecoderPath('/hero/draco/').setDecoderConfig({ type: 'wasm' }).setWorkerLimit(1);
    const loader = new GLTFLoader().setDRACOLoader(draco);
    let cancelled = false;
    let courier: CourierRig | undefined;
    const owned = new Set<Object3D>();
    const fetchChecked = async (path: string) => {
      const response = await fetch(path, { signal });
      if (!response.ok) throw new Error(`Hero asset: HTTP ${response.status}`);
      return response;
    };
    const loadModel = async (name: string) => {
      const response = await fetchChecked(`${base}models/${name}`);
      const data = await response.arrayBuffer();
      if (cancelled) return null;
      const gltf = await loader.parseAsync(data, `${base}models/`);
      if (cancelled) { disposeScene(gltf.scene); return null; }
      owned.add(gltf.scene);
      return gltf;
    };
    Promise.all([
      loadModel('whimsical-world.glb'), loadModel('courier.glb'),
      fetchChecked(`${base}models/surface.json`).then(response => response.json() as Promise<SurfaceMap>),
    ]).then(async ([planet, model, surface]) => {
      if (cancelled || !planet || !model) return;
      if (!Number.isInteger(surface.width) || !Number.isInteger(surface.height) || surface.width < 2 || surface.height < 2 || surface.radii?.length !== surface.width * surface.height || surface.radii.some(radius => !Number.isFinite(radius) || radius <= 0)) throw new Error('Invalid planet surface.');
      planet.scene.traverse(node => {
        node.updateMatrix();
        node.matrixAutoUpdate = false;
        if (!(node instanceof Mesh)) return;
        for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
          if (material instanceof MeshStandardMaterial) {
            material.side = FrontSide;
            material.metalness = 0;
            material.roughness = 0.86;
            material.normalScale.setScalar(0.65);
            if (material.map) material.map.anisotropy = 4;
          }
        }
      });
      courier = createCourierRig(model);
      const loaded = { planet: planet.scene, courier, surface };
      await prepareTextures(loaded, renderer, signal);
      if (!cancelled) setAsset(loaded);
    }).catch(reason => {
      if (!cancelled) setError(reason instanceof Error ? reason : new Error(String(reason)));
    }).finally(() => { if (!cancelled) draco.dispose(); });

    return () => {
      cancelled = true;
      abort.abort();
      draco.dispose();
      if (courier) { courier.mixer.stopAllAction(); courier.mixer.uncacheRoot(courier.scene); }
      owned.forEach(disposeScene);
      owned.clear();
    };
  }, [base, renderer]);
  if (error) throw error;
  return asset;
}
