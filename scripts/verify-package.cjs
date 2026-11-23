'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const requiredFiles = [
  'package.json',
  'README.md',
  'LICENSE',
  'CHANGELOG.md',
  'src/index.cjs',
  'src/index.mjs',
  'src/index.d.ts',
  'src/sound/assets/fa.wav',
  'src/sound/assets/success.wav',
  'src/sound/assets/warning.wav'
];

for (const relative of requiredFiles) {
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) throw new Error(`Required package file is missing: ${relative}`);
}

for (const name of ['fa', 'success', 'warning']) {
  const asset = fs.readFileSync(path.join(root, 'src/sound/assets', `${name}.wav`));
  if (asset.length < 44 || asset.toString('ascii', 0, 4) !== 'RIFF' || asset.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error(`Invalid WAV asset: ${name}.wav`);
  }
}

const api = require(path.join(root, 'src/index.cjs'));
for (const key of ['config', 'colors', 'memes', 'sound', 'logger', 'ui', 'animations', 'run']) {
  if (!(key in api)) throw new Error(`Public API is missing: ${key}`);
}

console.log(`Package verification passed (${requiredFiles.length} required files and 3 WAV assets).`);
