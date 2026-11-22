'use strict';

const fs = require('node:fs');
const path = require('node:path');
const dataset = require('./dataset.json');
const { runEvaluation } = require('./run-evaluation');

const outputDir = path.resolve(__dirname, '../evidence/repairs/re-evaluation');
const rawDir = path.join(outputDir, 'raw');
fs.mkdirSync(rawDir, { recursive: true });

function isoTimestamp() {
  return new Date().toISOString();
}

async function main() {
  const startedAt = isoTimestamp();
  const report = await runEvaluation();
  const completedAt = isoTimestamp();
  const casesById = new Map(dataset.cases.map((datum) => [datum.id, datum]));
  const rawRecords = [];
  const perCaseRecords = [];
  const serviceErrors = [];

  for (const result of report.results) {
    const datum = casesById.get(result.id);
    const rawRecord = {
      id: result.id,
      input: datum ? datum.input : null,
      reference_timestamp: datum ? datum.reference_timestamp : null,
      timezone: datum ? datum.timezone : null,
      raw_model_response: result.rawOutput,
      raw_response_recorded: result.rawResponseRecorded,
      status: result.status,
      captured_at: completedAt
    };
    rawRecords.push(rawRecord);
    fs.writeFileSync(
      path.join(rawDir, `${result.id}.json`),
      `${JSON.stringify(rawRecord, null, 2)}\n`
    );

    perCaseRecords.push({
      id: result.id,
      status: result.status,
      requirement_ids: datum ? datum.requirement_ids : [],
      invariant_ids: datum ? datum.invariant_ids : [],
      structural: result.structural,
      invariants: result.invariants,
      semantic: result.semantic
    });

    if (result.status === 'service_error') {
      serviceErrors.push({
        id: result.id,
        status: result.status,
        raw_response_recorded: result.rawResponseRecorded,
        detected_at: completedAt
      });
    }
  }

  fs.writeFileSync(
    path.join(outputDir, 'per-case.jsonl'),
    `${perCaseRecords.map((record) => JSON.stringify(record)).join('\n')}${perCaseRecords.length ? '\n' : ''}`
  );
  fs.writeFileSync(
    path.join(outputDir, 'raw-responses.json'),
    `${JSON.stringify(rawRecords, null, 2)}\n`
  );

  const modelConfig = {
    started_at: startedAt,
    completed_at: completedAt,
    ollama_base_url: 'http://127.0.0.1:11434',
    api_endpoint: 'http://127.0.0.1:11434/api/generate',
    model: 'qwen2.5:3b',
    ollama_version: '0.40.17',
    timezone: 'Asia/Kolkata',
    stream: false,
    format: 'approved-output-schema-json',
    temperature: 0,
    timeout_ms: 120000,
    dataset_id: dataset.dataset_id,
    dataset_version: dataset.dataset_version,
    dataset_case_count: dataset.case_count,
    attempted_cases: report.results.length,
    completed_cases: report.results.filter((result) =>
      result.status !== 'service_error' || result.rawResponseRecorded).length
  };
  fs.writeFileSync(
    path.join(outputDir, 'model-config.json'),
    `${JSON.stringify(modelConfig, null, 2)}\n`
  );
  fs.writeFileSync(
    path.join(outputDir, 'service-errors.json'),
    `${JSON.stringify({ count: serviceErrors.length, errors: serviceErrors }, null, 2)}\n`
  );

  const aggregate = report.summary;
  fs.writeFileSync(
    path.join(outputDir, 'eval-results.json'),
    `${JSON.stringify({
      ...aggregate,
      started_at: startedAt,
      completed_at: completedAt,
      attempted_cases: report.results.length
    }, null, 2)}\n`
  );

  const failed = report.results.filter((result) =>
    result.status === 'service_error' ||
    !result.structural.pass ||
    result.semantic.score !== 1 ||
    (result.invariants || []).some((item) => !item.pass)
  );
  const lines = [
    '# Genuine Re-evaluation Failure Report',
    '',
    `Started: ${startedAt}`,
    `Completed: ${completedAt}`,
    `Overall: ${aggregate.overall}`,
    `Attempts: ${report.results.length}/18`,
    `Structural passes: ${aggregate.structural_passes}/18`,
    `Safety-critical failures: ${aggregate.safety_violations}`,
    `Semantic successes: ${aggregate.semantic_successes}/18`,
    `Service errors: ${aggregate.service_errors}`,
    '',
    '## Failing Case IDs',
    ...failed.map((result) => {
      const reasons = [];
      if (result.status === 'service_error') reasons.push('service/model error');
      if (!result.structural.pass) reasons.push(`structural: ${(result.structural.errors || []).join('; ')}`);
      if (result.semantic.score !== 1) reasons.push(`semantic: ${result.semantic.reason}`);
      for (const failure of (result.invariants || []).filter((item) => !item.pass)) {
        reasons.push(`invariant ${failure.id}: ${failure.evidence}`);
      }
      return `- ${result.id}: ${reasons.join(' | ') || 'failed evaluation gate'}`;
    })
  ];
  fs.writeFileSync(
    path.join(outputDir, 'failure-feedback.md'),
    `${lines.join('\n')}\n`
  );

  process.stdout.write(`${JSON.stringify({
    attempted_cases: report.results.length,
    summary: aggregate,
    evidence_dir: 'evidence/repairs/re-evaluation'
  }, null, 2)}\n`);
  process.exitCode = aggregate.overall === 'PASS' ? 0 : 2;
}

main().catch((error) => {
  const completedAt = isoTimestamp();
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, 'model-config.json'),
    `${JSON.stringify({
      started_at: completedAt,
      completed_at: completedAt,
      status: 'capture_failure',
      error: String(error && error.message ? error.message : error),
      model: 'qwen2.5:3b',
      timezone: 'Asia/Kolkata'
    }, null, 2)}\n`
  );
  process.stderr.write(`${String(error && error.stack ? error.stack : error)}\n`);
  process.exitCode = 2;
});
