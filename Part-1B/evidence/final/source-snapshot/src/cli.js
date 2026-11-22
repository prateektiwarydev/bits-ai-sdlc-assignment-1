'use strict';

const { InvocationError } = require('./errors');
const { writeError, writeJsonResult } = require('./cli/presentation');
const { interpret } = require('./app');

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
async function run(argv = process.argv.slice(2)) {
  const values = parseArgs(argv);
  if (values.text === undefined) throw new InvocationError('Missing required --text option');
  if (values.reference === undefined) throw new InvocationError('Missing required --reference option');
  return interpret({
    text: values.text,
    referenceTimestamp: values.reference,
    timezone: 'Asia/Kolkata'
  });
}

if (require.main === module) {
  run().then((result) => {
    if (result.status === 'model_response') {
      writeJsonResult(result.output);
    } else {
      writeError({ code: result.status, message: 'Application could not accept model output' });
      process.exitCode = 2;
    }
  }).catch((error) => {
    writeError(error);
    process.exitCode = error.code === 'invocation_error' ? 2 : 1;
  });
}

module.exports = { parseArgs, run };
