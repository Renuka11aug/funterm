'use strict';

const fun = require('funterm');

async function main() {
  const progress = fun.animations.progress(5, { label: 'Demo progress' });
  for (let completed = 1; completed <= 5; completed += 1) {
    await new Promise(resolve => setTimeout(resolve, 120));
    progress.update(completed);
  }
  progress.stop();
  fun.logger.success('Progress demo complete');
}

main().catch(error => {
  fun.logger.error(error);
  process.exitCode = 1;
});
