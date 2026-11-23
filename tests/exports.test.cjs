'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fun = require('../src/index.cjs');

const expected = ['config', 'colors', 'memes', 'sound', 'logger', 'ui', 'animations', 'run'];

test('CommonJS API exports every documented top-level module', () => {
  for (const key of expected) assert.ok(key in fun, `missing ${key}`);
  assert.equal(typeof fun.run, 'function');
  assert.equal(typeof fun.logger.error, 'function');
  assert.equal(typeof fun.sound.play, 'function');
  assert.equal(typeof fun.ui.banner, 'function');
});

test('ESM default and named exports expose the same API', async () => {
  const esm = await import('funterm');
  assert.deepEqual(Object.keys(esm.default).sort(), Object.keys(fun).sort());
  for (const key of expected) assert.equal(esm[key], fun[key]);
});

test('public modules share one configuration instance', () => {
  const previous = fun.config.get().sound;
  fun.config.set({ sound: !previous });
  assert.equal(fun.sound.play instanceof Function, true);
  assert.equal(fun.config.get().sound, !previous);
  fun.config.reset();
});
