'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createConfig } = require('../src/config/index.cjs');
const { createAnimations } = require('../src/animations/index.cjs');

test('spinner renders and can be stopped with a completion message on a TTY', () => {
  const output = [];
  const animations = createAnimations(createConfig(), { isTTY: true, write: value => output.push(value), interval: 10000 });
  const spinner = animations.spinner('Loading');
  spinner.stop('Ready');
  assert.ok(output.some(line => line.includes('Loading')));
  assert.ok(output.some(line => line.includes('Ready')));
});

test('spinner is a no-op in non-TTY output and still returns a stop handle', () => {
  const output = [];
  const animations = createAnimations(createConfig(), { isTTY: false, write: value => output.push(value) });
  const spinner = animations.spinner('Loading');
  assert.equal(typeof spinner.stop, 'function');
  spinner.stop('Ready');
  assert.deepEqual(output, []);
});

test('progress renders percentage, clamps values, and completes', () => {
  const output = [];
  const animations = createAnimations(createConfig(), { isTTY: true, write: value => output.push(value) });
  const progress = animations.progress(10, { label: 'Build' });
  progress.update(5);
  assert.match(output.at(-1), /50%/);
  progress.update(20);
  assert.match(output.at(-1), /100%/);
  progress.stop();
  assert.match(output.join(''), /100%\n$/);
});

test('progress rejects invalid totals and updates', () => {
  const animations = createAnimations(createConfig(), { isTTY: false });
  assert.throws(() => animations.progress(0), /total/);
  const progress = animations.progress(10);
  assert.throws(() => progress.update('half'), /number/);
});

test('animations can be globally disabled', () => {
  const output = [];
  const animations = createAnimations(createConfig({ animations: false }), { isTTY: true, write: value => output.push(value) });
  const spinner = animations.spinner('Loading');
  spinner.stop('Ready');
  assert.deepEqual(output, []);
});

test('stopping a spinner without a message clears the active terminal line', () => {
  const output = [];
  const animations = createAnimations(createConfig(), { isTTY: true, write: value => output.push(value), interval: 10000 });
  const spinner = animations.spinner('Loading');
  spinner.stop();
  assert.match(output.join(''), /\u001b\[2K/);
});
