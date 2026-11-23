'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { spawn: realSpawn } = require('node:child_process');
const { createRunner } = require('../src/runner/index.cjs');

function loggerSpy() {
  const calls = [];
  return { calls, logger: {
    success: message => calls.push({ type: 'success', message }),
    error: error => calls.push({ type: 'error', message: error.message })
  } };
}

test('runner captures stdout and returns success for a zero exit code', async () => {
  const { logger, calls } = loggerSpy();
  const runner = createRunner({ logger });
  const result = await runner.run(process.execPath, ['-e', "process.stdout.write('hello')"]);
  assert.equal(result.success, true);
  assert.equal(result.exitCode, 0);
  assert.equal(result.stdout, 'hello');
  assert.equal(calls[0].type, 'success');
});

test('runner captures stderr and reports a non-zero exit as failure', async () => {
  const { logger, calls } = loggerSpy();
  const runner = createRunner({ logger });
  const result = await runner.run(process.execPath, ['-e', "process.stderr.write('nope'); process.exit(7)"]);
  assert.equal(result.success, false);
  assert.equal(result.exitCode, 7);
  assert.equal(result.stderr, 'nope');
  assert.equal(calls[0].type, 'error');
  assert.match(calls[0].message, /nope/);
});

test('runner returns a failed result when a command cannot be spawned', async () => {
  const { logger } = loggerSpy();
  const runner = createRunner({ logger });
  const result = await runner.run('funterm-command-that-does-not-exist-xyz', []);
  assert.equal(result.success, false);
  assert.equal(result.exitCode, null);
  assert.match(result.error.message, /spawn|not found|ENOENT/i);
});

test('runner terminates commands that exceed their timeout', async () => {
  const { logger } = loggerSpy();
  const runner = createRunner({ logger });
  const result = await runner.run(process.execPath, ['-e', 'setTimeout(() => {}, 5000)'], { timeout: 50, killGrace: 50 });
  assert.equal(result.success, false);
  assert.equal(result.timedOut, true);
  assert.match(result.error.message, /timed out/i);
});

test('runner streams output to callbacks and can suppress automatic reporting', async () => {
  const { logger, calls } = loggerSpy();
  const runner = createRunner({ logger });
  let streamed = '';
  const result = await runner.run(process.execPath, ['-e', "process.stdout.write('chunk')"], {
    report: false,
    onStdout: chunk => { streamed += chunk; }
  });
  assert.equal(result.success, true);
  assert.equal(streamed, 'chunk');
  assert.deepEqual(calls, []);
});

test('runner always spawns with shell disabled', async () => {
  let spawnOptions;
  const spawn = (command, args, options) => {
    spawnOptions = options;
    const child = new EventEmitter();
    child.stdout = new EventEmitter();
    child.stderr = new EventEmitter();
    process.nextTick(() => child.emit('close', 0, null));
    child.kill = () => {};
    return child;
  };
  const runner = createRunner({ logger: loggerSpy().logger, spawn });
  await runner.run('echo', ['safe'], { report: false });
  assert.equal(spawnOptions.shell, false);
});

test('runner validates arguments before spawning', async () => {
  const runner = createRunner({ logger: loggerSpy().logger, spawn: realSpawn });
  await assert.rejects(() => runner.run('', []), /command/);
  await assert.rejects(() => runner.run('echo', 'hello'), /args/);
  await assert.rejects(() => runner.run('echo', [], { timeout: -1 }), /timeout/);
});
