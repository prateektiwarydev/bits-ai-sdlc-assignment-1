'use strict';

const { InvocationError } = require('../src/errors');
const { writeError } = require('./cli/presentation');

function parseArgs(argv) {
  const values = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    if (key === '--text' || key === '--reference') {
      values[key.slice(2)] = argv[i + 1];
    }
  }
  return values;
}

const args = parseArgs(process.argv.slice(2));
if (args.text === undefined) {
  writeError(new InvocationError('Missing required --text option'));
  process.exitCode = 2;
} else if (args.reference === undefined) {
  writeError(new InvocationError('Missing required --reference option'));
  process.exitCode = 2;
} else {
  process.env.REMINDER_TEXT = args.text;
  process.env.REMINDER_REFERENCE = args.reference;
  writeError(new InvocationError('Application implementation is not yet in scope'));
  process.exitCode = 2;
}
