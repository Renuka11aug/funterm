'use strict';

const { spawn: nodeSpawn } = require('node:child_process');

function validateRun(command, args, options) {
  if (typeof command !== 'string' || command.trim() === '' || command.includes('\u0000')) {
    throw new TypeError('command must be a non-empty string without NUL characters');
  }
  if (!Array.isArray(args) || args.some(value => typeof value !== 'string' || value.includes('\u0000'))) {
    throw new TypeError('args must be an array of strings without NUL characters');
  }
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('options must be an object');
  if (options.timeout !== undefined && (!Number.isInteger(options.timeout) || options.timeout < 0 || options.timeout > 24 * 60 * 60 * 1000)) {
    throw new RangeError('timeout must be an integer between 0 and 86400000');
  }
  if (options.killGrace !== undefined && (!Number.isInteger(options.killGrace) || options.killGrace < 0 || options.killGrace > 30000)) {
    throw new RangeError('killGrace must be an integer between 0 and 30000');
  }
  if (options.cwd !== undefined && typeof options.cwd !== 'string') throw new TypeError('cwd must be a string');
  if (options.env !== undefined && (!options.env || typeof options.env !== 'object' || Array.isArray(options.env))) {
    throw new TypeError('env must be an object');
  }
}

function createRunner({ logger, spawn = nodeSpawn, now = Date.now } = {}) {
  async function run(command, args = [], options = {}) {
    validateRun(command, args, options);
    const timeout = options.timeout || 0;
    const killGrace = options.killGrace ?? 1000;
    const start = now();

    const result = await new Promise(resolve => {
      let child;
      let stdout = '';
      let stderr = '';
      let timedOut = false;
      let spawnError = null;
      let finished = false;
      let timeoutTimer = null;
      let forceKillTimer = null;

      const finish = (exitCode = null, signal = null) => {
        if (finished) return;
        finished = true;
        if (timeoutTimer) clearTimeout(timeoutTimer);
        if (forceKillTimer) clearTimeout(forceKillTimer);
        let error = null;
        if (timedOut) error = new Error(`Command timed out after ${timeout}ms: ${command}`);
        else if (spawnError) error = spawnError;
        else if (exitCode !== 0) error = new Error(stderr.trim() || stdout.trim() || (signal ? `Command terminated by signal ${signal}` : `Command exited with code ${exitCode}`));
        resolve({
          command,
          args: [...args],
          success: !timedOut && !spawnError && exitCode === 0,
          exitCode,
          signal,
          stdout,
          stderr,
          durationMs: Math.max(0, now() - start),
          error,
          timedOut
        });
      };

      try {
        child = spawn(command, args, {
          cwd: options.cwd,
          env: options.env ? { ...process.env, ...options.env } : process.env,
          stdio: ['ignore', 'pipe', 'pipe'],
          shell: false,
          windowsHide: true
        });
      } catch (error) {
        spawnError = error;
        finish(null, null);
        return;
      }

      if (child.stdout && typeof child.stdout.on === 'function') {
        child.stdout.on('data', chunk => {
          const value = chunk.toString();
          stdout += value;
          if (typeof options.onStdout === 'function') {
            try { options.onStdout(value); } catch { /* Consumer callbacks must not break process capture. */ }
          }
        });
      }
      if (child.stderr && typeof child.stderr.on === 'function') {
        child.stderr.on('data', chunk => {
          const value = chunk.toString();
          stderr += value;
          if (typeof options.onStderr === 'function') {
            try { options.onStderr(value); } catch { /* Consumer callbacks must not break process capture. */ }
          }
        });
      }

      child.once('error', error => {
        spawnError = error;
        finish(null, null);
      });
      child.once('close', (code, signal) => finish(code, signal));

      if (timeout > 0) {
        timeoutTimer = setTimeout(() => {
          timedOut = true;
          try { child.kill?.('SIGTERM'); } catch { /* A process may already have exited. */ }
          forceKillTimer = setTimeout(() => {
            try { child.kill?.('SIGKILL'); } catch { /* The process may already have exited. */ }
          }, killGrace);
          forceKillTimer.unref?.();
        }, timeout);
        timeoutTimer.unref?.();
      }
    });

    if (options.report !== false && logger) {
      if (result.success) logger.success(`Command completed: ${command}`);
      else logger.error(result.error || new Error(`Command failed: ${command}`));
    }
    return result;
  }

  return { run };
}

module.exports = { createRunner, validateRun };
