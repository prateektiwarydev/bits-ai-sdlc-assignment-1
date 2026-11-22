'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const dataset = require('../../evals/dataset.json');

test('dataset contains exactly 18 unique approved cases', () => {
  assert.equal(dataset.case_count, 18);
  assert.equal(dataset.cases.length, 18);
  const ids = dataset.cases.map((item) => item.id);
  assert.equal(new Set(ids).size, 18);
  assert.deepEqual(ids, [
    'C01', 'C02', 'C03', 'C04',
    'R01', 'R02', 'R03', 'R04',
    'S01', 'S02', 'S03', 'S04',
    'X01', 'X02', 'X03',
    'A01', 'A02', 'A03'
  ]);
});

test('every case has frozen context and traceability', () => {
  for (const item of dataset.cases) {
    assert.equal(item.timezone, 'Asia/Kolkata');
    assert.equal(typeof item.reference_timestamp, 'string');
    assert.equal(typeof item.input, 'string');
    assert.ok(item.ground_truth || item.semantic_rubric);
    assert.ok(Array.isArray(item.expected_properties));
    assert.ok(Array.isArray(item.requirement_ids));
    assert.ok(Array.isArray(item.invariant_ids));
  }
});
