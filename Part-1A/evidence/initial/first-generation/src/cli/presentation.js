function success(operation, fields) {
  return {
    ok: true,
    operation,
    ...fields,
  };
}

function failure(operation, code) {
  return {
    ok: false,
    operation,
    error: { code },
  };
}

function writeResult(operation, payload, exitCode) {
  process.stdout.write(JSON.stringify(payload) + "\n");
  process.exitCode = exitCode;
}

module.exports = {
  success,
  failure,
  writeResult,
};
