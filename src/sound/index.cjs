'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { playAudio } = require('./platform.cjs');

const SOUND_NAMES = Object.freeze(['fa', 'success', 'warning']);

function createSound(config, options = {}) {
  const platform = options.platform || process.platform;
  const spawn = options.spawn;
  const now = typeof options.now === 'function' ? options.now : Date.now;
  const output = typeof options.output === 'function' ? options.output : value => process.stdout.write(value);
  const isTTY = options.isTTY ?? Boolean(process.stdout && process.stdout.isTTY);
  const assetsDir = options.assetsDir || path.join(__dirname, 'assets');
  const lastPlayed = new Map();

  async function play(name) {
    if (!SOUND_NAMES.includes(name)) throw new TypeError(`Unknown sound: ${name}`);
    const currentConfig = config.get();
    if (!currentConfig.sound) return { played: false, fallback: false, reason: 'disabled' };

    const timestamp = now();
    if (name === 'fa' && currentConfig.errorSoundCooldown > 0) {
      const previous = lastPlayed.get(name);
      if (previous !== undefined && timestamp - previous < currentConfig.errorSoundCooldown) {
        return { played: false, fallback: false, reason: 'cooldown' };
      }
      lastPlayed.set(name, timestamp);
    }

    const assetPath = path.join(assetsDir, `${name}.wav`);
    if (!fs.existsSync(assetPath)) return useFallback('asset-missing');

    const result = await playAudio(assetPath, { platform, volume: currentConfig.volume, spawn });
    if (result.played) return { played: true, fallback: false, reason: null };
    return useFallback(result.reason);
  }

  function useFallback(reason) {
    if (isTTY) {
      try {
        output('\u0007');
        return { played: false, fallback: 'bell', reason };
      } catch {
        return { played: false, fallback: false, reason };
      }
    }
    return { played: false, fallback: false, reason };
  }

  function setVolume(value) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) {
      throw new RangeError('volume must be a number between 0 and 1');
    }
    config.set({ volume: value });
  }

  return {
    play,
    enable() { config.set({ sound: true }); },
    disable() { config.set({ sound: false }); },
    setEnabled(value) {
      if (typeof value !== 'boolean') throw new TypeError('enabled must be a boolean');
      config.set({ sound: value });
    },
    setVolume,
    getVolume() { return config.get().volume; },
    names: SOUND_NAMES
  };
}

module.exports = { createSound, SOUND_NAMES };
