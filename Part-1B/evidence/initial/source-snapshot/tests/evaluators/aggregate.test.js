'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { aggregate } = require('../../evals/aggregate');

function result(semanticPass = true, structuralPass = true, serviceError = false) {
  return {
    status: serviceError ? 'service_error' : 'model_response',
    rawResponseRecorded: true,
    structural: { pass: structuralPass },
    semantic: { score: semanticPass ? 1 : 0 },
    invariants: [{ id: 'INV-001', pass: true }]
  };
}

test('15 of 18 passes only with all mandatory gates', () => {
  const results = [
    ...Array.from({ length: 15 }, () => result(true)),
    ...Array.from({ length: 3 }, () => result(false))
  ];
  assert.equal(aggregate(results).overall, 'PASS');
});

test('14 of 18, skips, structural failures, service errors and missing evidence fail', () => {
  assert.equal(aggregate([...Array.from({ length: 14 }, () => result(true)), ...Array.from({ length: 4 }, () => result(false))]).overall, 'FAIL');
  assert.equal(aggregate(Array.from({ length: 17 }, () => result(true))).overall, 'FAIL');
  assert.equal(aggregate([...Array.from({ length: 17 }, () => result(true)), result(true, false)]).overall, 'FAIL');
  assert.equal(aggregate([...Array.from({ length: 17 }, () => result(true)), result(true, true, true)]).overall, 'FAIL');
  const missing = Array.from({ length: 18 }, () => ({ ...result(true), rawResponseRecorded: false }));
  assert.equal(aggregate(missing).overall, 'FAIL');
});
