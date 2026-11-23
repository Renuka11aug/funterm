'use strict';

const { DEFAULT_CONFIG, THEMES } = require('./defaults.cjs');

function validateConfig(partial) {
  if (!partial || typeof partial !== 'object' || Array.isArray(partial)) {
    throw new TypeError('Config must be a plain object');
  }

  const allowed = new Set(Object.keys(DEFAULT_CONFIG));
  for (const [key, value] of Object.entries(partial)) {
    if (!allowed.has(key)) throw new TypeError(`Unknown config option: ${key}`);
    if (key === 'theme' && !THEMES.includes(value)) {
      throw new TypeError(`Invalid theme: ${String(value)}. Choose ${THEMES.join(', ')}`);
    }
    if (['sound', 'colors', 'animations', 'memes', 'randomMessages', 'showStack', 'showOriginalError'].includes(key)
      && typeof value !== 'boolean') {
      throw new TypeError(`${key} must be a boolean`);
    }
    if (key === 'volume' && (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1)) {
      throw new RangeError('volume must be a number between 0 and 1');
    }
    if (key === 'errorSoundCooldown' && (!Number.isInteger(value) || value < 0 || value > 60000)) {
      throw new RangeError('errorSoundCooldown must be an integer between 0 and 60000');
    }
  }
}

function createConfig(initial = {}) {
  let current = { ...DEFAULT_CONFIG };
  if (Object.keys(initial).length) {
    validateConfig(initial);
    current = { ...current, ...initial };
  }

  return {
    get() {
      return { ...current };
    },
    set(partial) {
      validateConfig(partial);
      current = { ...current, ...partial };
      return { ...current };
    },
    reset() {
      current = { ...DEFAULT_CONFIG };
      return { ...current };
    }
  };
}

module.exports = { createConfig, DEFAULT_CONFIG, THEMES };
