# API reference

All examples use:

```js
const fun = require('funterm');
```

## `fun.config`

- `get()` returns a copy of the current config.
- `set(partial)` validates and applies partial settings.
- `reset()` restores defaults.

Settings: `theme`, `sound`, `colors`, `animations`, `memes`, `randomMessages`, `showStack`, `showOriginalError`, `errorSoundCooldown`, and `volume`.

## `fun.colors`

`black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `gray`, `bold`, `underline`, and `dim` wrap text. `rainbow(text)` applies a rainbow palette. `gradient(text, ['#ff00cc', '#3333ff'])` applies a multi-stop RGB gradient. `strip(text)` removes ANSI styling sequences. `isEnabled()` reports whether color output is enabled.

## `fun.memes`

- `message(kind, options?)` returns a message for `error`, `success`, `warning`, `info`, or `loading`.
- `show(kind, options?)` prints and returns the selected message.
- `categories` lists supported categories.

Set `randomMessages: false` for deterministic first-message output.

## `fun.sound`

- `play('fa' | 'success' | 'warning')` resolves to `{ played, fallback, reason }`.
- `enable()`, `disable()`, and `setEnabled(boolean)` control playback.
- `setVolume(0..1)` sets player volume where the adapter supports it.
- `getVolume()` returns the configured volume.

Missing playback utilities and unsupported platforms do not throw; they produce a fallback result.

## `fun.logger`

- `info(message)` prints an information line.
- `success(message)` prints a success meme and plays the success sound.
- `warning(message)` prints a warning meme and plays the warning sound.
- `error(error, { showStack? })` prints a meme headline and the original error message, then plays FAAAA. Stack output is controlled by config or the per-call option.

## `fun.ui`

- `banner(title)` prints a framed title.
- `box(content, { padding? })` prints framed text.
- `table(rows, { gap? })` prints a plain-text table.
- `divider(char?, width?)` prints a horizontal divider.

Each method also returns the generated string.

## `fun.animations`

- `spinner(label?)` returns `{ stop(message?) }`.
- `progress(total, { label? })` returns `{ update(value), stop() }`.

Both are no-ops when animations are disabled or stdout is not a TTY.

## `fun.run(command, args?, options?)`

Runs an executable with arguments using `spawn()` and `shell: false`. It returns a Promise of:

```ts
interface CommandResult {
  command: string;
  args: string[];
  success: boolean;
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
  durationMs: number;
  error: Error | null;
  timedOut: boolean;
}
```

See README for the supported options. Non-zero exits are results (`success: false`), not thrown exceptions. Invalid API arguments reject the Promise.
