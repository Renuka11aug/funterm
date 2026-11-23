'use strict';

const { THEMES } = require('../config/themes.cjs');

function valueToMessage(value) {
  if (value instanceof Error) return value.message || value.name;
  if (typeof value === 'string') return value;
  if (value === undefined) return 'An unexpected error occurred';
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function createLogger(config, options = {}) {
  const colors = options.colors || { green: value => value, cyan: value => value, yellow: value => value, red: value => value, magenta: value => value };
  const memes = options.memes || { message: kind => ({ error: 'FAAAAA 💀', success: 'LET\'S GOOOO', warning: 'OYYYY' })[kind] || '' };
  const output = typeof options.output === 'function' ? options.output : line => console.log(line);
  const sound = options.sound;

  function themed(kind, message) {
    const theme = THEMES[config.get().theme] || THEMES.meme;
    const colorName = theme[kind] || 'white';
    if (colorName === 'rainbow' && typeof colors.rainbow === 'function') return colors.rainbow(message);
    return typeof colors[colorName] === 'function' ? colors[colorName](message) : message;
  }

  function playSound(name) {
    if (config.get().sound && sound && typeof sound.play === 'function') {
      Promise.resolve().then(() => sound.play(name)).catch(() => {});
    }
  }

  function emit(kind, label, headline, message) {
    const parts = [themed(kind, label)];
    if (headline) parts.push(headline);
    if (message) parts.push(message);
    const line = parts.join(' ');
    output(line);
    return line;
  }

  return {
    info(message) {
      return emit('info', '[INFO]', '', String(message));
    },
    success(message) {
      const line = emit('success', '[SUCCESS]', memes.message('success'), String(message));
      playSound('success');
      return line;
    },
    warning(message) {
      const line = emit('warning', '[WARNING]', memes.message('warning'), String(message));
      playSound('warning');
      return line;
    },
    error(error, perCall = {}) {
      const headline = config.get().memes === false ? 'ERROR' : memes.message('error');
      const original = config.get().showOriginalError ? valueToMessage(error) : '';
      const includeStack = perCall.showStack ?? config.get().showStack;
      const stack = includeStack && error instanceof Error && error.stack ? error.stack : '';
      const line = emit('error', '[ERROR]', headline, [original, stack].filter(Boolean).join('\n'));
      playSound('fa');
      return line;
    }
  };
}

module.exports = { createLogger, valueToMessage };
