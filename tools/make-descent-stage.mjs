// Creates a "descent stage only" copy of NASA's Apollo Lunar Module model by removing
// every node whose centre sits above the descent stage (the ascent stage, which flew
// back to lunar orbit). Only geometry is removed; nothing is added or reshaped.
// Usage: node tools/make-descent-stage.mjs <in.glb> <out.glb> [cutY=2.5]
// A part is removed when the centre of its bounding box is above cutY (metres, model space).
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(join(ROOT, '_workbench', 'nodetools', 'package.json'));
const { NodeIO, getBounds } = require('@gltf-transform/core');
const { ALL_EXTENSIONS } = require('@gltf-transform/extensions');
const { prune } = require('@gltf-transform/functions');
const draco3d = require('draco3dgltf');

const [, , input, output, cut = "2.5"] = process.argv;
const cutY = Number(cut);

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'draco3d.encoder': await draco3d.createEncoderModule(),
});
const doc = await io.read(input);
const removed = [];
for (const node of doc.getRoot().listNodes()) {
  if (!node.getMesh()) continue;
  const { min, max } = getBounds(node);
  if ((min[1] + max[1]) / 2 >= cutY) {
    removed.push(`${node.getName()} y=[${min[1].toFixed(2)}, ${max[1].toFixed(2)}]`);
    node.dispose();
  }
}
// Drop animations entirely (the source file carries static per-node tracks).
for (const anim of doc.getRoot().listAnimations()) anim.dispose();
await doc.transform(prune());
await io.write(output, doc);
console.log(`removed ${removed.length} nodes with centre above y=${cutY}`);
console.log(removed.join('\n'));
