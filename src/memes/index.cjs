'use strict';

const { MESSAGES } = require('./messages.cjs');

function createMemes(config) {
  function message(kind, options = {}) {
    const pool = MESSAGES[kind];
    if (!pool) throw new TypeError(`Unknown meme category: ${kind}`);
    if (!config.get().randomMessages) return pool[0];
    const random = typeof options.random === 'function' ? options.random : Math.random;
    const index = Math.min(pool.length - 1, Math.max(0, Math.floor(random() * pool.length)));
    return pool[index];
  }

  return {
    message,
    show(kind, options) {
      const value = message(kind, options);
      console.log(value);
      return value;
    },
    categories: Object.freeze(Object.keys(MESSAGES))
  };
}

module.exports = { createMemes, MESSAGES };
