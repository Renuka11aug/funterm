'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createConfig } = require('../src/config/index.cjs');
const { createColors } = require('../src/colors/index.cjs');
const { createUI } = require('../src/ui/index.cjs');

function makeUI() {
  const output = [];
  const config = createConfig({ colors: false });
  const ui = createUI(createColors(config, { env: { NO_COLOR: '1' }, isTTY: false }), line => output.push(line));
  return { ui, output };
}

test('banner includes its title and decorative frame', () => {
  const { ui, output } = makeUI();
  const result = ui.banner('MY AWESOME APP');
  assert.equal(result, output[0]);
  assert.match(result, /MY AWESOME APP/);
  assert.match(result, /╔/);
});

test('box wraps multiline text and aligns its border', () => {
  const { ui } = makeUI();
  const result = ui.box('Hello\nFunTerm');
  const lines = result.split('\n');
  assert.equal(lines.length, 4);
  assert.equal(lines[0].length, lines[1].length);
  assert.equal(lines[1].length, lines[2].length);
  assert.equal(lines[2].length, lines[3].length);
});

test('table aligns columns and handles an empty table', () => {
  const { ui } = makeUI();
  const result = ui.table([['Name', 'Status'], ['API', 'Online'], ['Database', 'Ready']]);
  const lines = result.split('\n');
  assert.equal(lines.length, 3);
  assert.ok(lines[0].indexOf('Status') > lines[0].indexOf('Name'));
  assert.equal(ui.table([]), '');
});

test('divider validates width and emits a repeated separator', () => {
  const { ui } = makeUI();
  assert.equal(ui.divider('-', 5), '-----');
  assert.throws(() => ui.divider('-', 0), /width/);
});

test('table keeps columns aligned when cells already contain ANSI colors', () => {
  const { ui } = makeUI();
  const colored = '\u001b[31mAPI\u001b[39m';
  const result = ui.table([['Name', 'Status'], [colored, 'Online'], ['LongService', 'Ready']]);
  const plain = result.replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, '').split('\n');
  assert.equal(plain[1].indexOf('Online'), plain[2].indexOf('Ready'));
});
