'use strict';

const { detectColorSupport } = require('./detect.cjs');

const ANSI = Object.freeze({
  black: [30, 39], red: [31, 39], green: [32, 39], yellow: [33, 39],
  blue: [34, 39], magenta: [35, 39], cyan: [36, 39], white: [37, 39],
  gray: [90, 39], bold: [1, 22], underline: [4, 24], dim: [2, 22]
});
const RAINBOW = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#00c7be', '#007aff', '#af52de'];
const ANSI_PATTERN = /\u001b\[[0-?]*[ -/]*[@-~]/g;

function parseHex(value) {
  if (typeof value !== 'string' || !/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)) {
    throw new TypeError('Expected a hex color such as #ff00cc');
  }
  const hex = value.length === 4
    ? value.slice(1).split('').map(char => char + char).join('')
    : value.slice(1);
  return [0, 2, 4].map(offset => Number.parseInt(hex.slice(offset, offset + 2), 16));
}

function colorEnabled(config, options) {
  if (config.get().colors === false) return false;
  return detectColorSupport(options);
}

function createColors(config, options = {}) {
  const api = {};
  for (const [name, [open, close]] of Object.entries(ANSI)) {
    api[name] = text => {
      const value = String(text);
      return colorEnabled(config, options) ? `\u001b[${open}m${value}\u001b[${close}m` : value;
    };
  }

  api.rainbow = text => {
    const value = String(text);
    if (!colorEnabled(config, options)) return value;
    const chars = Array.from(value);
    return chars.map((char, index) => {
      if (/\s/.test(char)) return char;
      const [r, g, b] = parseHex(RAINBOW[index % RAINBOW.length]);
      return `\u001b[38;2;${r};${g};${b}m${char}\u001b[39m`;
    }).join('');
  };

  api.gradient = (text, stops) => {
    const value = String(text);
    if (!Array.isArray(stops) || stops.length < 2) throw new TypeError('gradient requires at least two hex color stops');
    const parsed = stops.map(parseHex);
    if (!colorEnabled(config, options) || value.length === 0) return value;
    const chars = Array.from(value);
    return chars.map((char, index) => {
      if (/\s/.test(char)) return char;
      const position = chars.length <= 1 ? 0 : index / (chars.length - 1);
      const segment = Math.min(parsed.length - 2, Math.floor(position * (parsed.length - 1)));
      const local = position * (parsed.length - 1) - segment;
      const rgb = parsed[segment].map((start, channel) => Math.round(start + (parsed[segment + 1][channel] - start) * local));
      return `\u001b[38;2;${rgb.join(';')}m${char}\u001b[39m`;
    }).join('');
  };

  api.strip = text => String(text).replace(ANSI_PATTERN, '');
  api.isEnabled = () => colorEnabled(config, options);
  return api;
}

module.exports = { createColors, detectColorSupport, parseHex };
