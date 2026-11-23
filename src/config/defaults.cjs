'use strict';

const DEFAULT_CONFIG = Object.freeze({
  theme: 'meme',
  sound: true,
  colors: true,
  animations: true,
  memes: true,
  randomMessages: true,
  showStack: false,
  showOriginalError: true,
  errorSoundCooldown: 2000,
  volume: 0.7
});

const THEMES = Object.freeze(['meme', 'arcade', 'rainbow', 'minimal']);

module.exports = { DEFAULT_CONFIG, THEMES };
