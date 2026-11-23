'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createConfig } = require('../src/config/index.cjs');
const { createColors } = require('../src/colors/index.cjs');
const { createMemes } = require('../src/memes/index.cjs');
const { createLogger } = require('../src/logger/index.cjs');

function makeLogger(overrides = {}) {
  const config = createConfig({ colors: false, randomMessages: false, ...overrides.config });
  const output = [];
  const logger = createLogger(config, {
    colors: createColors(config, { env: { NO_COLOR: '1' }, isTTY: false }),
    memes: createMemes(config),
    output: line => output.push(line),
    sound: overrides.sound
  });
  return { logger, output };
}

test('logger prints info and success messages with clear labels', () => {
  const { logger, output } = makeLogger();
  logger.info('Starting app');
  logger.success('Server ready');
  assert.match(output[0], /INFO/);
  assert.match(output[0], /Starting app/);
  assert.match(output[1], /LET'S GOOOOOO/);
  assert.match(output[1], /Server ready/);
});

test('logger warning keeps the supplied message', () => {
  const { logger, output } = makeLogger();
  logger.warning('Disk almost full');
  assert.match(output[0], /OYYYY/);
  assert.match(output[0], /Disk almost full/);
});

test('logger error preserves original error and only shows stack when configured', () => {
  const error = new Error('Database connection failed');
  const { logger, output } = makeLogger();
  logger.error(error);
  assert.match(output[0], /BRO WHAT JUST HAPPENED/);
  assert.match(output[0], /Database connection failed/);
  assert.doesNotMatch(output[0], /logger.test.cjs/);
});

test('logger can include stack and can be called with a string', () => {
  const error = new Error('Boom');
  const { logger, output } = makeLogger({ config: { showStack: true } });
  logger.error(error);
  assert.match(output[0], /logger.test.cjs/);
  logger.error('plain failure');
  assert.match(output[1], /plain failure/);
});

test('logger triggers an available sound adapter without propagating playback failures', async () => {
  let requested = '';
  const { logger } = makeLogger({ sound: { play: async name => { requested = name; throw new Error('no audio device'); } } });
  assert.doesNotThrow(() => logger.error(new Error('bad')));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested, 'fa');
});

test('logger selects a distinct sound for success, warning, and error events', async () => {
  const played = [];
  const { logger } = makeLogger({ sound: { play: async name => { played.push(name); } } });
  logger.success('done');
  logger.warning('careful');
  logger.error(new Error('failed'));
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(played, ['success', 'warning', 'fa']);
});
