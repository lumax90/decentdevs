import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(root, 'public/hero');
const revision = 'b3f70fbf4b577845b1d9d5947c9410fb4d925dae';
const base = `https://raw.githubusercontent.com/fadeichev2121/planet/${revision}`;
await mkdir(resolve(output, 'models'), { recursive: true });
await mkdir(resolve(output, 'draco'), { recursive: true });

const models = await Promise.all(['whimsical-world.glb', 'courier.glb'].map(async name => {
  const destination = resolve(output, 'models', name);
  let bytes;
  try { bytes = await readFile(destination); }
  catch {
    const response = await fetch(`${base}/models/${name}`);
    if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
    bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.readUInt32LE(0) !== 0x46546c67) throw new Error(`${name}: not a GLB`);
    await writeFile(destination, bytes);
  }
  return { name, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
}));

for (const name of ['draco_wasm_wrapper.js', 'draco_decoder.wasm']) {
  await copyFile(resolve(root, 'node_modules/three/examples/jsm/libs/draco/gltf', name), resolve(output, 'draco', name));
}
await writeFile(resolve(output, 'assets.json'), JSON.stringify({ source: 'Orbit Delivery Hero / fadeichev2121/planet', revision, models }, null, 2) + '\n');
console.log(models);
