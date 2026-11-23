'use strict';

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

function createAnimations(config, options = {}) {
  const isTTY = options.isTTY ?? Boolean(process.stdout && process.stdout.isTTY);
  const write = typeof options.write === 'function' ? options.write : value => process.stdout.write(value);
  const interval = Number.isInteger(options.interval) && options.interval >= 10 ? options.interval : 80;

  function spinner(label = 'Loading') {
    let timer = null;
    let stopped = false;
    if (isTTY && config.get().animations) {
      let index = 0;
      write(`\r${FRAMES[index]} ${String(label)}`);
      timer = setInterval(() => {
        index = (index + 1) % FRAMES.length;
        write(`\r${FRAMES[index]} ${String(label)}`);
      }, interval);
      timer.unref?.();
    }
    return {
      stop(message) {
        if (stopped) return;
        stopped = true;
        if (timer) clearInterval(timer);
        if (isTTY && config.get().animations) {
          const ending = message ? `${String(message)}\n` : '\n';
          write(`\r\u001b[2K${ending}`);
        }
      }
    };
  }

  function progress(total, progressOptions = {}) {
    if (typeof total !== 'number' || !Number.isFinite(total) || total <= 0) throw new RangeError('total must be a positive number');
    const label = progressOptions.label ? `${String(progressOptions.label)} ` : '';
    let current = 0;
    let stopped = false;
    function render() {
      if (isTTY && config.get().animations) {
        const percent = Math.round((current / total) * 100);
        const filled = Math.round(percent / 5);
        write(`\r${label}[${'█'.repeat(filled)}${'░'.repeat(20 - filled)}] ${percent}%`);
      }
    }
    render();
    return {
      update(value) {
        if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError('progress update must be a number');
        if (stopped) return;
        current = Math.max(0, Math.min(total, value));
        render();
      },
      stop() {
        if (stopped) return;
        stopped = true;
        current = total;
        render();
        if (isTTY && config.get().animations) write('\n');
      }
    };
  }

  return { spinner, progress };
}

module.exports = { createAnimations };
