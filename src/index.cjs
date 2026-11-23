'use strict';

const { createConfig } = require('./config/index.cjs');
const { createColors } = require('./colors/index.cjs');
const { createMemes } = require('./memes/index.cjs');
const { createSound } = require('./sound/index.cjs');
const { createLogger } = require('./logger/index.cjs');
const { createUI } = require('./ui/index.cjs');
const { createAnimations } = require('./animations/index.cjs');
const { createRunner } = require('./runner/index.cjs');

const config = createConfig();
const colors = createColors(config);
const memes = createMemes(config);
const sound = createSound(config);
const logger = createLogger(config, { colors, memes, sound });
const ui = createUI(colors);
const animations = createAnimations(config);
const runner = createRunner({ logger });

const funterm = {
  config,
  colors,
  memes,
  sound,
  logger,
  ui,
  animations,
  run: runner.run
};

module.exports = funterm;
