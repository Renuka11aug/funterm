'use strict';

function detectColorSupport({ env = process.env, isTTY = Boolean(process.stdout && process.stdout.isTTY) } = {}) {
  if (Object.prototype.hasOwnProperty.call(env, 'NO_COLOR')) return false;
  if (Object.prototype.hasOwnProperty.call(env, 'FORCE_COLOR')) return env.FORCE_COLOR !== '0' && env.FORCE_COLOR !== '';
  return Boolean(isTTY);
}

module.exports = { detectColorSupport };
