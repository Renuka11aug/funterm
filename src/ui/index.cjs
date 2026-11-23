'use strict';

const ANSI_PATTERN = /\u001b\[[0-?]*[ -/]*[@-~]/g;

function visibleLength(value) {
  return String(value).replace(ANSI_PATTERN, '').length;
}

function createUI(colors = {}, output = line => console.log(line)) {
  function write(value) {
    output(value);
    return value;
  }

  function box(content, options = {}) {
    const padding = options.padding ?? 1;
    if (!Number.isInteger(padding) || padding < 0 || padding > 8) throw new RangeError('padding must be an integer from 0 to 8');
    const lines = String(content).split('\n');
    const innerWidth = Math.max(1, ...lines.map(visibleLength)) + padding * 2;
    const top = `╭${'─'.repeat(innerWidth + 2)}╮`;
    const body = lines.map(line => {
      const left = ' '.repeat(padding);
      const right = ' '.repeat(innerWidth - padding - visibleLength(line));
      return `│ ${left}${line}${right} │`;
    });
    const bottom = `╰${'─'.repeat(innerWidth + 2)}╯`;
    return write([top, ...body, bottom].join('\n'));
  }

  function banner(title) {
    const value = String(title);
    const width = Math.max(8, visibleLength(value) + 4);
    const line = `╔${'═'.repeat(width)}╗`;
    const body = `║${' '.repeat(Math.max(1, Math.floor((width - visibleLength(value)) / 2)))}${value}${' '.repeat(Math.max(1, Math.ceil((width - visibleLength(value)) / 2)))}║`;
    return write([line, body, line].join('\n'));
  }

  function table(rows, options = {}) {
    if (!Array.isArray(rows)) throw new TypeError('rows must be an array');
    if (rows.length === 0) return '';
    const normalized = rows.map(row => {
      if (!Array.isArray(row)) throw new TypeError('each table row must be an array');
      return row.map(value => String(value));
    });
    const columns = Math.max(...normalized.map(row => row.length));
    const widths = Array.from({ length: columns }, (_, index) => Math.max(1, ...normalized.map(row => visibleLength(row[index] ?? ''))));
    const gap = Number.isInteger(options.gap) && options.gap >= 1 ? options.gap : 2;
    const rendered = normalized.map(row => row.map((value, index) => `${value}${' '.repeat(Math.max(0, widths[index] - visibleLength(value)))}`).join(' '.repeat(gap)).trimEnd());
    return write(rendered.join('\n'));
  }

  function divider(char = '─', width = 40) {
    if (typeof char !== 'string' || Array.from(char).length !== 1) throw new TypeError('divider char must be one character');
    if (!Number.isInteger(width) || width < 1 || width > 500) throw new RangeError('width must be an integer from 1 to 500');
    return write(char.repeat(width));
  }

  return { banner, box, table, divider };
}

module.exports = { createUI, visibleLength };
