'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createConfig } = require('../src/config/index.cjs');
const { createColors, detectColorSupport } = require('../src/colors/index.cjs');

test('colors wrap text in ANSI codes when color output is supported', () => {
  const colors = createColors(createConfig(), { env: {}, isTTY: true });
  assert.equal(colors.red('hello'), '\u001b[31mhello\u001b[39m');
  assert.equal(colors.bold('hello'), '\u001b[1mhello\u001b[22m');
  assert.equal(colors.underline('hello'), '\u001b[4mhello\u001b[24m');
});

test('colors stay plain when disabled or NO_COLOR is present', () => {
  const disabled = createColors(createConfig({ colors: false }), { env: {}, isTTY: true });
  const noColor = createColors(createConfig(), { env: { NO_COLOR: '1', FORCE_COLOR: '1' }, isTTY: true });
  assert.equal(disabled.green('hello'), 'hello');
  assert.equal(noColor.green('hello'), 'hello');
});

test('FORCE_COLOR enables ANSI output when stdout is not a TTY', () => {
  assert.equal(detectColorSupport({ env: { FORCE_COLOR: '1' }, isTTY: false }), true);
  const colors = createColors(createConfig(), { env: { FORCE_COLOR: '1' }, isTTY: false });
  assert.match(colors.blue('hello'), /^\u001b\[34m/);
});

test('rainbow and gradient produce truecolor ANSI output', () => {
  const colors = createColors(createConfig(), { env: { FORCE_COLOR: '1' }, isTTY: false });
  assert.match(colors.rainbow('FUN'), /\u001b\[38;2;/);
  assert.match(colors.gradient('FunTerm', ['#ff00cc', '#3333ff']), /\u001b\[38;2;/);
});

test('gradient validates its colors and strips ANSI sequences', () => {
  const colors = createColors(createConfig(), { env: { FORCE_COLOR: '1' }, isTTY: false });
  assert.throws(() => colors.gradient('x', ['red']), /hex color/);
  assert.equal(colors.strip('\u001b[31mred\u001b[39m'), 'red');
});
