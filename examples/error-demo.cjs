'use strict';

const fun = require('funterm');

try {
  throw new Error('The example intentionally failed so you can see the FAAAA reaction.');
} catch (error) {
  fun.logger.error(error);
}
