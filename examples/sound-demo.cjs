'use strict';

const fun = require('funterm');

async function main() {
  const result = await fun.sound.play('fa');
  if (!result.played) {
    console.log(`Audio fallback: ${result.reason}`);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
