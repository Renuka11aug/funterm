'use strict';

const THEMES = Object.freeze({
  meme: { success: 'green', info: 'cyan', warning: 'yellow', error: 'red', accent: 'magenta' },
  arcade: { success: 'green', info: 'blue', warning: 'yellow', error: 'magenta', accent: 'cyan' },
  rainbow: { success: 'rainbow', info: 'cyan', warning: 'yellow', error: 'rainbow', accent: 'magenta' },
  minimal: { success: 'green', info: 'white', warning: 'yellow', error: 'red', accent: 'white' }
});

module.exports = { THEMES };
