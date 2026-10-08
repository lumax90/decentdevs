import { readFile, writeFile } from 'node:fs/promises';
import { BufferAttribute, BufferGeometry, DoubleSide, Group, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three';

// Bake the supplied GLB's relief once. The browser only interpolates this small
// height map instead of raycasting the planet's 16,000 triangles every frame.
const input = new URL('../../public/hero/models/whimsical-world.glb', import.meta.url);
const bytes = await readFile(input);
const jsonLength = bytes.readUInt32LE(12);
const gltf = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString());
const binary = bytes.subarray(28 + jsonLength);
const componentSizes = { 5121: 1, 5123: 2, 5125: 4, 5126: 4 };
const readers = { 5121: 'getUint8', 5123: 'getUint16', 5125: 'getUint32', 5126: 'getFloat32' };
const itemSizes = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };

function accessor(index) {
  const spec = gltf.accessors[index];
  const view = gltf.bufferViews[spec.bufferView];
  const data = new DataView(binary.buffer, binary.byteOffset, binary.byteLength);
  const itemSize = itemSizes[spec.type];
  const bytesPerComponent = componentSizes[spec.componentType];
  const values = spec.componentType === 5126 ? new Float32Array(spec.count * itemSize) : new Uint32Array(spec.count * itemSize);
  for (let i = 0; i < spec.count; i++) {
    for (let j = 0; j < itemSize; j++) {
      const offset = (view.byteOffset || 0) + (spec.byteOffset || 0) + i * (view.byteStride || itemSize * bytesPerComponent) + j * bytesPerComponent;
      values[i * itemSize + j] = data[readers[spec.componentType]](offset, true);
    }
  }
  return new BufferAttribute(values, itemSize);
}

const material = new MeshBasicMaterial({ side: DoubleSide });
const nodes = gltf.nodes.map(node => {
  const group = new Group();
  if (node.translation) group.position.fromArray(node.translation);
  if (node.rotation) group.quaternion.fromArray(node.rotation);
  if (node.scale) group.scale.fromArray(node.scale);
  if (node.matrix) { group.matrix.fromArray(node.matrix); group.matrix.decompose(group.position, group.quaternion, group.scale); }
  if (node.mesh !== undefined) for (const primitive of gltf.meshes[node.mesh].primitives) {
    if (primitive.extensions?.KHR_draco_mesh_compression) throw new Error('Rebake with an uncompressed GLB.');
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', accessor(primitive.attributes.POSITION));
    if (primitive.indices !== undefined) geometry.setIndex(accessor(primitive.indices));
    geometry.computeBoundingSphere();
    group.add(new Mesh(geometry, material));
  }
  return group;
});
gltf.nodes.forEach((node, i) => node.children?.forEach(child => nodes[i].add(nodes[child])));
const root = new Group();
gltf.scenes[gltf.scene || 0].nodes.forEach(i => root.add(nodes[i]));
root.updateMatrixWorld(true);

const width = 128, height = 65;
const ray = new Raycaster(new Vector3(), new Vector3(), 0.7, 1.3);
const radii = [];
for (let y = 0; y < height; y++) {
  const phi = y / (height - 1) * Math.PI;
  for (let x = 0; x < width; x++) {
    const theta = x / width * Math.PI * 2;
    ray.ray.direction.set(Math.sin(phi) * Math.sin(theta), Math.cos(phi), Math.sin(phi) * Math.cos(theta));
    const hit = ray.intersectObject(root, true)[0];
    radii.push(Number((hit?.distance ?? 0.97).toFixed(5)));
  }
}
await writeFile(new URL('../../public/hero/models/surface.json', import.meta.url), JSON.stringify({ width, height, radii }) + '\n');
console.log({ samples: radii.length, minimum: Math.min(...radii), maximum: Math.max(...radii) });
