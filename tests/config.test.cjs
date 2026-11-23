'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createConfig, DEFAULT_CONFIG } = require('../src/config/index.cjs');

test('config starts with documented defaults and returns defensive copies', () => {
  const config = createConfig();
  const value = config.get();
  assert.deepEqual(value, DEFAULT_CONFIG);
  value.theme = 'broken';
  assert.equal(config.get().theme, 'meme');
});

test('config applies valid partial updates and retains other values', () => {
  const config = createConfig();
  config.set({ sound: false, volume: 0.25 });
  assert.equal(config.get().sound, false);
  assert.equal(config.get().volume, 0.25);
  assert.equal(config.get().theme, 'meme');
});

test('config rejects unknown keys and invalid values without partial mutation', () => {
  const config = createConfig();
  assert.throws(() => config.set({ sound: false, madeUp: true }), /Unknown config option/);
  assert.equal(config.get().sound, true);
  assert.throws(() => config.set({ volume: 2 }), /volume/);
  assert.throws(() => config.set({ theme: 'not-a-theme' }), /theme/);
  assert.throws(() => config.set({ animations: 'yes' }), /animations/);
});

test('config reset restores all defaults', () => {
  const config = createConfig();
  config.set({ sound: false, theme: 'arcade', volume: 0.1 });
  config.reset();
  assert.deepEqual(config.get(), DEFAULT_CONFIG);
});
