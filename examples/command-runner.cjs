'use strict';

const fun = require('funterm');

async function main() {
  const result = await fun.run(process.execPath, ['-e', "console.log('Hello from a child process')"]);
  console.log('Captured stdout:', result.stdout.trim());
}

main().catch(error => {
  fun.logger.error(error);
  process.exitCode = 1;
});
