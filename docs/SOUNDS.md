# Sound effects

FunTerm bundles three original synthesized WAV effects:

| Name | Use | Approximate role |
|---|---|---|
| `fa` | Errors | Comic descending buzzer / FAAAA reaction |
| `success` | Successful events | Short ascending arcade chime |
| `warning` | Warnings | Two-pulse alert tone |

## Playback behavior

- Sound defaults to enabled.
- `fun.logger.error()` requests `fa`; `success()` and `warning()` request their matching effects.
- Repeated FAAAA playback is limited by `errorSoundCooldown` (default 2000 ms).
- `fun.sound.disable()` suppresses all sound; `enable()` turns it back on.
- On macOS FunTerm uses `afplay`; on Linux it tries `paplay`, `aplay`, and `ffplay`; on Windows it uses PowerShell's `System.Media.SoundPlayer`.
- If a player is not available, FunTerm attempts the terminal bell on TTY output. Otherwise the caller receives `{ played: false, fallback: false, reason }`.
- Playback is asynchronous and does not block the Node.js event loop while the system player runs.

Volume is passed to playback tools that support it. Windows' built-in WAV player uses the host system's sound level.

The bundled sound effects are synthesized original waveforms made for this package. They are not recordings of copyrighted meme audio.
