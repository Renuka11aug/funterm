# FunTerm 🎉

[![npm version](https://img.shields.io/npm/v/funterm.svg?color=cb3837)](https://www.npmjs.com/package/funterm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/node/v/funterm.svg)](https://nodejs.org)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Renuka11aug%2Ffunterm-181717?logo=github)](https://github.com/Renuka11aug/funterm)

**Make your terminal less boring.** FunTerm is a playful, meme-style terminal toolkit for Node.js. It adds colorful output, funny success and error messages, original sound effects (including the iconic FAAAA buzzer), simple terminal UI components, progress animations, and a command runner that reports real process results.

> FunTerm reacts to errors; it does not hide them. Your actual error message, exit code, stdout, and stderr remain available.

## Install

```bash
npm install funterm
```

FunTerm has **zero runtime dependencies** and supports Node.js 18 or newer. The package offers CommonJS, ESM, and TypeScript declarations.

## Quick start

### CommonJS

```js
const fun = require('funterm');

fun.ui.banner('MY AWESOME APP');
fun.logger.info('Starting application...');
fun.logger.success('Server started successfully!');
fun.logger.warning('This operation may take a while');

try {
  // Your application code goes here.
  throw new Error('The database refused the connection');
} catch (error) {
  fun.logger.error(error); // Meme headline + original error + FAAAA sound
}
```

### ESM

```js
import fun, { logger, colors, sound } from 'funterm';

logger.success('LET\'S GOOOO!');
console.log(colors.rainbow('Hello from FunTerm'));
await sound.play('fa');
```

## Run a command and detect its result

FunTerm cannot automatically inspect arbitrary commands typed into an unrelated terminal shell. Run a command through `fun.run()` to capture its real process result and show the appropriate reaction automatically.

```js
const result = await fun.run('npm', ['test']);

if (result.success) {
  console.log(`Tests passed in ${result.durationMs}ms`);
} else {
  console.log('The original error is still available:', result.error?.message);
  console.log('stderr:', result.stderr);
}
```

`fun.run(command, args, options)` uses Node's `spawn()` with `shell: false`. Pass the executable and its arguments separately. It does not evaluate a shell command string.

Options:

- `cwd`: working directory.
- `env`: environment variables merged over `process.env`.
- `timeout`: process timeout in milliseconds; `0` (default) disables it.
- `killGrace`: time before a forced kill after timeout; default `1000` ms.
- `report`: automatic meme logger; default `true`. Set `false` to handle the result yourself.
- `onStdout` / `onStderr`: optional callbacks receiving text chunks.

The returned object contains `command`, `args`, `success`, `exitCode`, `signal`, `stdout`, `stderr`, `durationMs`, `error`, and `timedOut`.

## Fun features

```js
fun.colors.rainbow('RAINBOW MODE 🌈');
fun.colors.gradient('FunTerm', ['#ff00cc', '#3333ff']);
fun.logger.success('Build completed');
fun.logger.error(new Error('Something went wrong'));
fun.memes.show('loading');
fun.ui.box('Hello, terminal!');
fun.ui.table([['Service', 'Status'], ['API', 'Online'], ['DB', 'Ready']]);

const spinner = fun.animations.spinner('Cooking...');
// Do async work here.
spinner.stop('Done!');

const progress = fun.animations.progress(100, { label: 'Downloading' });
progress.update(50);
progress.update(100);
progress.stop();
```

See [`docs/API.md`](docs/API.md), [`docs/THEMES.md`](docs/THEMES.md), and [`docs/SOUNDS.md`](docs/SOUNDS.md) for the full reference.

## Sound

Sound is enabled by default. `fun.logger.error()` plays the original FAAAA effect; success and warning events play their own short effects. The sound module uses available operating-system playback tools and falls back to a terminal bell when possible. Audio availability depends on the host machine and terminal settings.

```js
fun.sound.disable();
fun.sound.enable();
fun.sound.setVolume(0.5); // 0.0 to 1.0 where the player supports volume
await fun.sound.play('fa');
```

To prevent repeated errors from becoming a wall of sound, FAAAA playback has a default 2-second cooldown.

All bundled WAV files are original synthesized effects created for FunTerm.

## Configuration

```js
fun.config.set({
  theme: 'meme',
  sound: true,
  colors: true,
  animations: true,
  memes: true,
  randomMessages: true,
  showOriginalError: true,
  showStack: false,
  errorSoundCooldown: 2000,
  volume: 0.7
});

// Restore defaults
fun.config.reset();
```

Themes: `meme` (default), `arcade`, `rainbow`, and `minimal`.

FunTerm respects `NO_COLOR`. `FORCE_COLOR=1` enables ANSI colors in redirected output unless `NO_COLOR` is also present. Animations are disabled automatically when stdout is not a TTY.

## Compatibility

- Node.js 18+
- macOS: uses `afplay` when available.
- Linux: tries `paplay`, `aplay`, then `ffplay`.
- Windows: uses Windows PowerShell's built-in WAV playback API.
- Other environments: text output remains available; a terminal bell is attempted where appropriate.

Playback utilities are optional system capabilities, not npm dependencies. FunTerm never makes network requests.

## License

MIT. See [`LICENSE`](LICENSE).
