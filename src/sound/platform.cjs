'use strict';

const path = require('node:path');

function commandsFor(platform, assetPath, volume) {
  if (platform === 'darwin') return [{ command: 'afplay', args: ['-v', String(volume), assetPath] }];
  if (platform === 'linux') {
    const paplayVolume = String(Math.round(volume * 65536));
    return [
      { command: 'paplay', args: [`--volume=${paplayVolume}`, assetPath] },
      { command: 'aplay', args: ['-q', assetPath] },
      { command: 'ffplay', args: ['-nodisp', '-autoexit', '-loglevel', 'quiet', '-volume', String(Math.round(volume * 100)), assetPath] }
    ];
  }
  if (platform === 'win32') {
    const escapedPath = path.resolve(assetPath).replace(/'/g, "''");
    const script = `$player = New-Object System.Media.SoundPlayer '${escapedPath}'; $player.PlaySync()`;
    return [{ command: 'powershell.exe', args: ['-NoProfile', '-NonInteractive', '-Command', script] }];
  }
  return [];
}

function runPlayer(commandSpec, spawnImpl) {
  return new Promise(resolve => {
    let child;
    let settled = false;
    const finish = result => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    try {
      child = spawnImpl(commandSpec.command, commandSpec.args, {
        stdio: 'ignore',
        shell: false,
        windowsHide: true
      });
    } catch (error) {
      finish({ played: false, reason: error.code || 'spawn-error' });
      return;
    }
    child.once('error', error => finish({ played: false, reason: error.code || 'spawn-error' }));
    child.once('close', code => finish({ played: code === 0, reason: code === 0 ? null : `player-exit-${code}` }));
  });
}

async function playAudio(assetPath, { platform = process.platform, volume = 0.7, spawn: spawnImpl = require('node:child_process').spawn } = {}) {
  for (const commandSpec of commandsFor(platform, assetPath, volume)) {
    const result = await runPlayer(commandSpec, spawnImpl);
    if (result.played) return { played: true, reason: null };
  }
  return { played: false, reason: commandsFor(platform, assetPath, volume).length ? 'player-unavailable' : 'unsupported-platform' };
}

module.exports = { commandsFor, playAudio, runPlayer };
