# FunTerm v1 Design

## Intent

FunTerm is a general-purpose Node.js terminal presentation package that makes application output colorful, playful, and meme-driven. Its signature behavior is a funny error reaction with an optional synthesized “FAAAAA” sound, while always preserving the real error or process result so developers can still debug.

The package is for developers, students, and CLI authors who want more engaging terminal feedback without adopting a hosted service or a large framework.

## Goals

- Provide colorful text: standard ANSI colors, text styles, rainbow text, and RGB gradients.
- Provide a meme-style message engine for success, info, warning, loading, and error events.
- Provide logging methods that retain the original message, Error details, and optional stack.
- Play bundled, original sound effects for error, success, and warning events where the host has a supported player; degrade gracefully otherwise.
- Provide banners, boxes, tables, dividers, spinners, and progress indicators.
- Provide a command runner that captures stdout/stderr and exit status without using a shell by default, and automatically presents the result unless disabled.
- Support CommonJS, ESM, TypeScript declarations, configurable themes, and clean non-TTY output.
- Avoid runtime dependencies and network activity.

## Non-goals

- No cybersecurity features or security-specific formatters.
- No global shell-hook installation and no interception of arbitrary terminal commands.
- No web dashboard, telemetry, remote service, database, or account system.
- No arbitrary shell command evaluation by default.
- No platform-specific native addon requirement.

## User-visible behavior

- `fun.logger.success(message)` displays a success meme and the supplied message.
- `fun.logger.error(error)` displays a randomly selected meme error headline, the original error message, and an optional stack, and triggers the FAAAA sound when enabled.
- `await fun.run(command, args)` runs a process using `spawn()` and `shell: false`; by default it automatically reports success/failure. `report: false` suppresses automatic presentation.
- Sound is on by default but can be disabled. If playback is unavailable, FunTerm emits a terminal bell when practical and returns a structured playback result without throwing.
- Random meme selection can be disabled for predictable output.
- Colors and animations adapt to terminal capability and environment variables. `NO_COLOR` disables color; `FORCE_COLOR` can enable color in non-TTY output unless `NO_COLOR` is set.

## Approaches considered

1. **Zero-runtime-dependency Node.js package with OS audio adapters (selected).** Use Node built-ins, bundle original WAV assets, call supported OS playback utilities with fixed argument arrays and `shell: false`, and fall back to terminal bell/text. This keeps install size and dependency risk low while covering common desktop environments.
2. **Use an npm audio playback dependency.** This can simplify audio playback but adds runtime dependency and platform-specific behavior outside FunTerm's control. Rejected for v1 because zero dependencies and a graceful fallback are more important.
3. **Use only terminal bell characters.** This is most portable but does not provide a distinctive bundled FAAAA effect and depends on terminal preferences. Rejected as the primary behavior; it remains a fallback.

## Architecture

- `src/config`: defaults, themes, and validated mutable configuration.
- `src/colors`: ANSI styling and color-capability detection.
- `src/memes`: category-based meme messages with deterministic mode.
- `src/sound`: WAV assets, platform adapter, cooldown, and fallback behavior.
- `src/logger`: info/success/warning/error output and original error details.
- `src/ui`: banner, box, table, and divider helpers.
- `src/animations`: spinner and progress interfaces with non-TTY fallbacks.
- `src/runner`: asynchronous child-process runner using `spawn()` and `shell: false`.
- `src/index.cjs` and `src/index.mjs`: CommonJS and ESM entry points.
- `src/index.d.ts`: public TypeScript declarations.

## Public API

```js
const fun = require('funterm');

fun.config.set({ theme: 'meme', sound: true, colors: true });
fun.logger.info('Starting');
fun.logger.success('It worked');
fun.logger.warning('Careful');
fun.logger.error(new Error('Something failed'));

fun.colors.rainbow('HELLO');
fun.colors.gradient('FunTerm', ['#ff00cc', '#3333ff']);
fun.memes.message('error');
fun.sound.play('fa');
fun.ui.banner('MY APP');
fun.ui.box('Hello');
fun.ui.table([['Name', 'Status'], ['API', 'Online']]);
const spinner = fun.animations.spinner('Loading');
spinner.stop('Done');
const progress = fun.animations.progress(100);
progress.update(50);
progress.stop();

const result = await fun.run('npm', ['test'], { timeout: 60_000 });
```

`fun.run()` resolves to `{ command, args, success, exitCode, signal, stdout, stderr, durationMs, error, timedOut }`. Non-zero exit codes and spawn/timeout failures resolve as unsuccessful results rather than hiding the original outcome. Invalid API arguments throw synchronously.

## Constraints and calls left to the builder

- Node.js minimum: 18.
- Runtime dependencies: zero.
- License: MIT, provided all bundled audio is original and generated for this package.
- Package name: `funterm` (name availability is not a condition for creating a local tarball; publishing requires a separate name check).
- CommonJS is the implementation source; ESM re-exports the CommonJS API.
- Audio asset: synthesize an original short WAV locally; do not include copyrighted meme recordings.
- Audio adapters: macOS `afplay`; Linux `paplay`, `aplay`, or `ffplay`; Windows PowerShell `System.Media.SoundPlayer`. Pass fixed command arguments with `shell: false`. If unavailable, use a terminal bell fallback where possible.
- No publish, network access, installation of global tools, or deployment in this task. Create only local source ZIP and npm `.tgz` artifacts.
- User asked for both a `.tgz` and a `.zip`.

## Acceptance

- `npm test` passes using Node's built-in test runner.
- `npm run build` completes without external dependencies.
- `npm pack --dry-run` contains entry points, types, documentation, and sound assets.
- A locally packed archive installs in a fresh consumer project.
- CommonJS and ESM smoke tests both pass.
- Runner returns accurate real process results and never enables shell execution by default.
- Sound can be disabled and does not crash when no supported player exists.
- Redirected/non-TTY output does not leave cursor animations running.
