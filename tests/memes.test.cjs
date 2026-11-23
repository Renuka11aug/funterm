'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createConfig } = require('../src/config/index.cjs');
const { createMemes } = require('../src/memes/index.cjs');

test('meme engine returns a message from the requested category', () => {
  const memes = createMemes(createConfig());
  assert.equal(memes.message('error', { random: () => 0 }), 'BRO WHAT JUST HAPPENED 💀');
  assert.match(memes.message('success', { random: () => 0 }), /LET'S GOOOOOO|ABSOLUTE CINEMA/);
});

test('deterministic mode always selects the first message', () => {
  const memes = createMemes(createConfig({ randomMessages: false }));
  assert.equal(memes.message('error'), 'BRO WHAT JUST HAPPENED 💀');
  assert.equal(memes.message('error'), 'BRO WHAT JUST HAPPENED 💀');
});

test('meme engine rejects unknown categories', () => {
  const memes = createMemes(createConfig());
  assert.throws(() => memes.message('cyber'), /Unknown meme category/);
});

test('show writes and returns the same meme message', () => {
  const memes = createMemes(createConfig({ randomMessages: false }));
  const previous = console.log;
  let captured = '';
  console.log = value => { captured = value; };
  try {
    const result = memes.show('warning');
    assert.equal(captured, result);
    assert.match(result, /OYYYY/);
  } finally {
    console.log = previous;
  }
});
