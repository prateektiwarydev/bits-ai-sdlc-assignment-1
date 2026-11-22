'use strict';

const fs = require('node:fs');
const path = require('node:path');
const dataset = require('./dataset.json');
const { validateOutput } = require('./schema-validator');
const { validateInvariants } = require('./invariant-validator');
const { evaluateSemantic } = require('./semantic-evaluator');
const { aggregate } = require('./aggregate');

async function resolveApplication() {
  try {
    const appPath = path.resolve(__dirname, '../src/app.js');
    if (!fs.existsSync(appPath)) return null;
    return require(appPath);
  } catch (error) {
    return null;
  }
}

async function runEvaluation(options = {}) {
  const interpret = options.interpret;
  const app = interpret ? null : await resolveApplication();
  const interpreter = interpret || (app && typeof app.interpret === 'function'
    ? app.interpret
    : null);
  const results = [];

  for (const datum of dataset.cases) {
    let status = 'model_response';
    let rawOutput = null;
    let rawResponseRecorded = false;
    let output = null;
    let structural = { pass: false, errors: ['Application integration unavailable'] };
    let invariants = [];

    if (!interpreter) {
      status = 'service_error';
      rawOutput = null;
      rawResponseRecorded = false;
      invariants = [{ id: 'INV-009', pass: false, evidence: 'Application integration unavailable' }];
    } else {
      try {
        const response = await interpreter({
          text: datum.input,
          referenceTimestamp: datum.reference_timestamp,
          timezone: datum.timezone
        });
        rawOutput = response.rawResponse;
        rawResponseRecorded = typeof rawOutput === 'string';
        output = response.output;
        if (response.status === 'service_error') {
          status = 'service_error';
        } else {
          structural = validateOutput(output);
          invariants = validateInvariants(output || {}, datum);
        }
      } catch (error) {
        status = 'service_error';
        rawResponseRecorded = false;
      }
    }

    const semantic = evaluateSemantic(output, datum, structural.pass);
    results.push({ id: datum.id, status, rawOutput, rawResponseRecorded, structural, invariants, semantic });
  }

  return { summary: aggregate(results), results };
}

if (require.main === module) {
  runEvaluation().then((report) => {
    process.stdout.write(`${JSON.stringify(report.summary, null, 2)}\n`);
    process.exitCode = report.summary.overall === 'PASS' ? 0 : 2;
  });
}

module.exports = { runEvaluation };
