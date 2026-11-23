'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const fs = require('node:fs');
const path = require('node:path');
const { createConfig } = require('../src/config/index.cjs');
const { createSound } = require('../src/sound/index.cjs');

function mockSpawn(outcome = 'success') {
  const calls = [];
  const spawn = (command, args, options) => {
    calls.push({ command, args, options });
    const child = new EventEmitter();
    process.nextTick(() => {
      if (outcome === 'missing') {
        const error = new Error('not found');
        error.code = 'ENOENT';
        child.emit('error', error);
      } else {
        child.emit('close', outcome === 'success' ? 0 : 1, null);
      }
    });
    return child;
  };
  return { spawn, calls };
}

test('sound assets are bundled for all public sound names', () => {
  for (const name of ['fa', 'success', 'warning']) {
    const asset = path.join(__dirname, '..', 'src', 'sound', 'assets', `${name}.wav`);
    assert.equal(fs.existsSync(asset), true, `${name}.wav should exist`);
  }
});

test('sound reports disabled state without launching a player', async () => {
  const { spawn, calls } = mockSpawn();
  const sound = createSound(createConfig({ sound: false }), { spawn, platform: 'darwin' });
  assert.deepEqual(await sound.play('fa'), { played: false, fallback: false, reason: 'disabled' });
  assert.equal(calls.length, 0);
});

test('sound selects the macOS player and passes fixed shell-free arguments', async () => {
  const { spawn, calls } = mockSpawn();
  const sound = createSound(createConfig(), { spawn, platform: 'darwin', output: () => {} });
  const result = await sound.play('fa');
  assert.equal(result.played, true);
  assert.equal(calls[0].command, 'afplay');
  assert.ok(calls[0].args.includes(path.join(__dirname, '..', 'src', 'sound', 'assets', 'fa.wav')));
  assert.equal(calls[0].options.shell, false);
});

test('sound tries subsequent Linux players when the first one is missing', async () => {
  const calls = [];
  const spawn = (command, args, options) => {
    calls.push(command);
    const child = new EventEmitter();
    process.nextTick(() => {
      if (calls.length === 1) {
        const error = new Error('missing');
        error.code = 'ENOENT';
        child.emit('error', error);
      } else {
        child.emit('close', 0, null);
      }
    });
    return child;
  };
  const sound = createSound(createConfig(), { spawn, platform: 'linux', output: () => {} });
  assert.equal((await sound.play('success')).played, true);
  assert.equal(calls[0], 'paplay');
  assert.equal(calls[1], 'aplay');
});

test('sound falls back to a terminal bell when no player is available', async () => {
  const { spawn } = mockSpawn('missing');
  let output = '';
  const sound = createSound(createConfig(), { spawn, platform: 'linux', isTTY: true, output: value => { output += value; } });
  const result = await sound.play('warning');
  assert.equal(result.played, false);
  assert.equal(result.fallback, 'bell');
  assert.equal(output, '\u0007');
});

test('sound cooldown prevents repeated FAAAA playback', async () => {
  const { spawn, calls } = mockSpawn();
  let now = 1000;
  const sound = createSound(createConfig({ errorSoundCooldown: 2000 }), { spawn, platform: 'darwin', now: () => now, output: () => {} });
  assert.equal((await sound.play('fa')).played, true);
  now = 1500;
  assert.deepEqual(await sound.play('fa'), { played: false, fallback: false, reason: 'cooldown' });
  assert.equal(calls.length, 1);
  now = 4000;
  assert.equal((await sound.play('fa')).played, true);
  assert.equal(calls.length, 2);
});

test('sound validates names and volume and supports enable/disable', async () => {
  const sound = createSound(createConfig(), { spawn: mockSpawn().spawn, platform: 'darwin' });
  await assert.rejects(() => sound.play('party'), /Unknown sound/);
  assert.throws(() => sound.setVolume(2), /volume/);
  sound.disable();
  assert.equal((await sound.play('fa')).reason, 'disabled');
  sound.enable();
  sound.setVolume(0.4);
  assert.equal(sound.getVolume(), 0.4);
});
