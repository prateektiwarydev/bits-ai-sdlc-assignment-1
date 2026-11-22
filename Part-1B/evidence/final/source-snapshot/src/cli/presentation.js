'use strict';

function writeJsonResult(result) {
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

function writeError(error) {
  process.stderr.write(`${JSON.stringify({
    status: 'error',
    code: error.code || 'validation_error',
    message: error.message
  })}\n`);
}

module.exports = { writeJsonResult, writeError };
